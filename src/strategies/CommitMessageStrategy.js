import { OpenAIError } from "../errors/CustomError.js";

export class CommitMessageStrategy {
  constructor() {
    if (this.constructor === CommitMessageStrategy) {
      throw new Error("CommitMessageStrategy is an abstract class");
    }
  }

  async generate(diff, variation = 0) {
    throw new Error("generate method must be implemented");
  }

  validateDiff(diff) {
    if (!diff || typeof diff !== "string" || diff.trim().length === 0) {
      throw new Error("Diff must be a non-empty string");
    }
    return diff.trim();
  }
}

export class OpenAICommitMessageStrategy extends CommitMessageStrategy {
  constructor(openaiClient, config) {
    super();
    this.openai = openaiClient;
    this.config = config;
  }

  async generate(diff, variation = 0) {
    const validatedDiff = this.validateDiff(diff);

    const prompt = this.buildPrompt(validatedDiff);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.openai.model,
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
        temperature: this.config.openai.temperature,
        max_tokens: this.config.openai.maxTokens,
      });

      const text = completion.choices[0].message.content.trim();
      return this.parseResponse(text, variation);
    } catch (error) {
      throw new OpenAIError(
        `Failed to generate commit message: ${error.message}`
      );
    }
  }

  buildPrompt(diff) {
    const conventionalCommits = this.config.commit.enableConventionalCommits
      ? "- follow conventional commits if applicable (feat, fix, chore)"
      : "";

    return `
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
- specific descriptive of the changes (max ${this.config.commit.maxLength} chars)
- focus on what changed and why. 
${conventionalCommits}
- unique from each other
`;
  }

  parseResponse(text, variation) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data.messages)) {
        return data.messages[variation % data.messages.length];
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("❌ Failed to parse AI response:", text, error);
      return `${this.config.commit.defaultType}: update code (variation ${variation})`;
    }
  }
}

export class FallbackCommitMessageStrategy extends CommitMessageStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  async generate(diff, variation = 0) {
    this.validateDiff(diff);
    return `${this.config.commit.defaultType}: update code (variation ${variation})`;
  }
}
