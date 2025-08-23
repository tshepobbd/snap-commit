import OpenAI from "openai";
import chalk from "chalk";
import dotenv from "dotenv";

// Load environment variables silently
const originalLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalLog;

export class OpenAIProvider {
  constructor() {
    this.validateApiKey();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.AI_MODEL || "gpt-3.5-turbo";
  }

  validateApiKey() {
    if (!process.env.OPENAI_API_KEY) {
      console.error(
        chalk.red("\n❌ OPENAI_API_KEY environment variable is not set.\n")
      );
      console.error(chalk.yellow("Please set your OpenAI API key:"));
      console.error(
        chalk.cyan(
          "1. Get your API key from: https://platform.openai.com/api-keys"
        )
      );
      console.error(chalk.cyan("2. Set it as an environment variable:"));
      console.error(chalk.cyan("   export OPENAI_API_KEY=your_api_key_here"));
      console.error(
        chalk.cyan(
          "   or create a .env file with: OPENAI_API_KEY=your_api_key_here\n"
        )
      );
      process.exit(1);
    }
  }

  async generateCommitMessages(diff, count = 3) {
    const prompt = this.buildPrompt(diff, count);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
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

      return this.parseResponse(completion.choices[0].message.content);
    } catch (error) {
      if (error.code === "insufficient_quota") {
        throw new Error(
          "OpenAI API quota exceeded. Please check your billing."
        );
      }
      if (error.code === "invalid_api_key") {
        throw new Error("Invalid OpenAI API key. Please check your .env file.");
      }
      throw error;
    }
  }

  buildPrompt(diff, count) {
    return `
You are an expert software engineer that writes concise, meaningful git commit messages.
The staged changes are:

${diff.substring(0, 3000)}

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
  }

  parseResponse(text) {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const data = JSON.parse(jsonText);

      if (Array.isArray(data.messages) && data.messages.length > 0) {
        return data.messages;
      }

      throw new Error("Invalid response formatt here");
    } catch (error) {
      console.error("Failed to parse AI responses:", error.message);
      // Fallback messages
      return [
        "chore: update code",
        "fix: resolve issues",
        "feat: add new functionality",
      ];
    }
  }

  getModel() {
    return this.model;
  }
}
