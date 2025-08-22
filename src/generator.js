// import OpenAI from "openai";

import OpenAI from "openai/index.js";
import { PostHog } from "posthog-node";
import chalk from "chalk";
import dotenv from "dotenv";
//heu there
dotenv.config();

// console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

const client = new PostHog("phc_6Q1Lzrq9R0ZL6STL5y4oz7tmdpYBBmClnhfMhj1D3x3", {
  host: "https://us.i.posthog.com",
});

// console.log("API KEY", process.env.OPENAI_API_KEY);
// Check if API key is availablee
if (!process.env.OPENAI_API_KEY) {
  console.error(
    chalk.red("❌ OPENAI_API_KEY environment variable is not set.")
  );
  console.error(chalk.yellow("Please set your OpenAI API key:"));
  console.error(
    chalk.cyan("1. Get your API key from: https://platform.openai.com/api-keys")
  );
  console.error(chalk.cyan("2. Set it as an environment variable:"));
  console.error(chalk.cyan("   export OPENAI_API_KEY=your_api_key_here"));
  console.error(
    chalk.cyan(
      "   or create a .env file with: OPENAI_API_KEY=your_api_key_here"
    )
  );
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMessage(diff, variation = 0) {
  // Use OpenAI to generate multiple commit suggestions
  const prompt = `
You are an expert software engineer that writes concise, meaningful git commit messages.
The staged changes are:

${diff}

Generate 3 different commit message suggestions. 
Respond ONLY with a JSON object like:

{
  "messages": [
    "first commit message",
    "second commit message",
    "third commit message"
  ]
}

Make the messages:
- specific descriptive of the changes (max 72 chars)
- focus on what changed and why. 
- if multiple files are staged, summarize changes per area/module instead of one generic commit message.
- follow conventional commits if applicable (feat, fix, chore)
- unique from each other
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that returns clean JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const text = completion.choices[0].message.content.trim();

  // parse JSON safely - handle markdown code blocks
  try {
    // Remove markdown code blocks if present
    let jsonText = text;
    if (text.startsWith("```json")) {
      jsonText = text.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (text.startsWith("```")) {
      jsonText = text.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const data = JSON.parse(jsonText);
    if (Array.isArray(data.messages)) {
      // Track successful AI generation
      client.capture({
        distinctId: `user_${Math.random().toString(36).substr(2, 9)}`,
        event: "ai_generation_successful",
        properties: {
          variation,
          messageCount: data.messages.length,
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          responseLength: text.length,
          timestamp: new Date().toISOString(),
        },
      });
      return data.messages[variation % data.messages.length]; // pick one for the variation index
    }
  } catch (err) {
    console.error("❌ Failed to parse AI response:", text, err);

    // Track AI generation failure
    client.capture({
      distinctId: `user_${Math.random().toString(36).substr(2, 9)}`,
      event: "ai_generation_failed",
      properties: {
        variation,
        error: err.message,
        responseText: text.substring(0, 200), // First 200 chars for debugging
        model: "gpt-3.5-turbo",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // fallback if parsing fails
  return `chore: update code (variation ${variation})`;
}
