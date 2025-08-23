import express from "express";
import cors from "cors";
import helmet from "helmet";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper function to split diff into chunks
function splitDiffIntoChunks(diff, maxChunkSize = 2000) {
  const lines = diff.split("\n");
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const line of lines) {
    const lineSize = line.length + 1; // +1 for newline

    if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n"));
      currentChunk = [line];
      currentSize = lineSize;
    } else {
      currentChunk.push(line);
      currentSize += lineSize;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n"));
  }

  return chunks;
}

// Helper function to generate commit messages for a single chunk
async function generateMessagesForChunk(chunk, count) {
  const prompt = `
You are an expert software engineer that writes concise, meaningful git commit messages.
The staged changes are:

${chunk}

Generate ${count} different commit message suggestions. 
Respond ONLY with a JSON object like:

{
  "messages": [
    "first commit message",
    "second commit message",
    "third commit message"
  ]
}

Make the messages:
- Specific and descriptive of the changes (max 72 chars)
- Focus on what changed and why
- If multiple files are staged, summarize changes per area/module
- Follow conventional commits format (feat, fix, chore, docs, style, refactor, test, perf)
- Unique from each other
- Use present tense ("add" not "added")
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that writes concise, meaningful git commit messages and returns clean JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const responseText = completion.choices[0].message.content.trim();

  // Parse response
  let jsonText = responseText;
  if (responseText.startsWith("```json")) {
    jsonText = responseText.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (responseText.startsWith("```")) {
    jsonText = responseText.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  const data = JSON.parse(jsonText);

  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    throw new Error("Invalid response format from AI");
  }

  return data.messages;
}

// Main endpoint for generating commit messages
app.post("/api/generate-commit", async (req, res) => {
  try {
    const { diff, count = 3 } = req.body;

    // Validate input
    if (!diff || typeof diff !== "string") {
      return res.status(400).json({
        error: "Invalid diff provided. Must be a non-empty string.",
      });
    }

    if (count < 1 || count > 10) {
      return res.status(400).json({
        error: "Count must be between 1 and 10.",
      });
    }

    // Split diff into chunks if it's too large
    const chunks = splitDiffIntoChunks(diff, 2000);

    if (chunks.length === 1) {
      // Single chunk - process normally
      const messages = await generateMessagesForChunk(chunks[0], count);

      res.json({
        success: true,
        messages: messages.slice(0, count),
        model: "gpt-3.5-turbo",
        timestamp: new Date().toISOString(),
        chunksProcessed: 1,
      });
    } else {
      // Multiple chunks - process in batches
      console.log(`Processing ${chunks.length} chunks for large diff`);

      const allMessages = [];
      const messagesPerChunk = Math.max(1, Math.floor(count / chunks.length));

      // Process chunks in parallel with a limit
      const batchSize = 3; // Process max 3 chunks at a time
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchPromises = batch.map((chunk) =>
          generateMessagesForChunk(chunk, messagesPerChunk).catch((error) => {
            console.error("Error processing chunk:", error);
            return ["chore: update code"]; // Fallback for failed chunks
          })
        );

        const batchResults = await Promise.all(batchPromises);
        allMessages.push(...batchResults.flat());
      }

      // Remove duplicates and limit to requested count
      const uniqueMessages = [...new Set(allMessages)];

      res.json({
        success: true,
        messages: uniqueMessages.slice(0, count),
        model: "gpt-3.5-turbo",
        timestamp: new Date().toISOString(),
        chunksProcessed: chunks.length,
        totalMessages: allMessages.length,
        uniqueMessages: uniqueMessages.length,
      });
    }
  } catch (error) {
    console.error("Error generating commit messages:", error);

    // Handle specific OpenAI errors
    if (error.code === "context_length_exceeded") {
      return res.status(400).json({
        error:
          "Diff is too large. Please stage fewer files or reduce the diff size.",
        retryAfter: 0,
      });
    }

    if (error.code === "insufficient_quota") {
      return res.status(503).json({
        error: "Service temporarily unavailable due to quota limits",
        retryAfter: 3600, // 1 hour
      });
    }

    if (error.code === "invalid_api_key") {
      return res.status(500).json({
        error: "Service configuration error",
      });
    }

    // Return fallback messages for other errors
    res.json({
      success: true,
      messages: [
        "chore: update code",
        "fix: resolve issues",
        "feat: add new functionality",
      ].slice(0, req.body.count || 3),
      model: "fallback",
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Snap-commit backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
