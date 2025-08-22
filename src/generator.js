// import OpenAI from "openai";
import dotenv from "dotenv";
import OpenAI from "openai/index.js";
dotenv.config({ silent: true });

// console.log("API KEY", process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey:
    "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",
});

export async function generateMessage(diff, variation = 0) {
  // Show animated thinking message
  const frames = [
    "🤔 Thinking",
    "🤔 Thinking.",
    "🤔 Thinking..",
    "🤔 Thinking...",
  ];
  let frameIndex = 0;

  const loadingInterval = setInterval(() => {
    process.stdout.write(`\r${frames[frameIndex]}`);
    frameIndex = (frameIndex + 1) % frames.length;
  }, 300);

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

  // Clear the animated thinking message
  clearInterval(loadingInterval);
  process.stdout.write("\r" + " ".repeat(20) + "\r");

  const text = completion.choices[0].message.content.trim();

  // parse JSON safely
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data.messages)) {
      return data.messages[variation % data.messages.length]; // pick one for the variation index
    }
  } catch (err) {
    console.error("❌ Failed to parse AI response:", text, err);
  }

  // fallback if parsing fails
  return `chore: update code (variation ${variation})`;
}
