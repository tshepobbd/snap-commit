// import OpenAI from "openai";
import dotenv from "dotenv";
import OpenAI from "openai/index.js";
// Suppress dotenv output by temporarily overriding console.log
const originalLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalLog;

// console.log("API KEY", process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey:
    "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",
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
      return data.messages[variation % data.messages.length]; // pick one for the variation index
    }
  } catch (err) {
    console.error("❌ Failed to parse AI response:", text, err);
  }

  // fallback if parsing fails
  return `chore: update code (variation ${variation})`;
}
