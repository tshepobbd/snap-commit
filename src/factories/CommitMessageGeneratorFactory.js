import OpenAI from "openai/index.js";
import {
  OpenAICommitMessageStrategy,
  FallbackCommitMessageStrategy,
} from "../strategies/CommitMessageStrategy.js";
import { ConfigurationError } from "../errors/CustomError.js";

export class CommitMessageGeneratorFactory {
  static create(config) {
    const validationErrors = config.validate();
    if (validationErrors.length > 0) {
      throw new ConfigurationError(
        `Configuration errors: ${validationErrors.join(", ")}`
      );
    }

    // Check if OpenAI is properly configured
    if (config.openai.apiKey) {
      try {
        const openaiClient = new OpenAI({
          apiKey: config.openai.apiKey,
        });
        return new OpenAICommitMessageStrategy(openaiClient, config);
      } catch (error) {
        console.warn(
          "⚠️ Failed to initialize OpenAI client, falling back to basic generator"
        );
        return new FallbackCommitMessageStrategy(config);
      }
    } else {
      console.warn("⚠️ No OpenAI API key provided, using fallback generator");
      return new FallbackCommitMessageStrategy(config);
    }
  }

  static createWithFallback(config) {
    try {
      return this.create(config);
    } catch (error) {
      console.warn("⚠️ Using fallback generator due to configuration issues");
      return new FallbackCommitMessageStrategy(config);
    }
  }
}

export default CommitMessageGeneratorFactory;
