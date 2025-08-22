import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

class Config {
  constructor() {
    this._config = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      },
      commit: {
        maxLength: parseInt(process.env.COMMIT_MAX_LENGTH) || 72,
        defaultType: process.env.COMMIT_DEFAULT_TYPE || "chore",
        enableConventionalCommits:
          process.env.ENABLE_CONVENTIONAL_COMMITS !== "false",
      },
      cli: {
        defaultMessageCount: parseInt(process.env.DEFAULT_MESSAGE_COUNT) || 3,
        tempFilePrefix: process.env.TEMP_FILE_PREFIX || "commit-msg",
      },
      git: {
        diffCommand: process.env.GIT_DIFF_COMMAND || "git diff --cached",
        commitCommand: process.env.GIT_COMMIT_COMMAND || "git commit",
      },
    };
  }

  get openai() {
    return this._config.openai;
  }

  get commit() {
    return this._config.commit;
  }

  get cli() {
    return this._config.cli;
  }

  get git() {
    return this._config.git;
  }

  get all() {
    return this._config;
  }

  validate() {
    const errors = [];

    if (!this.openai.apiKey) {
      errors.push("OPENAI_API_KEY is required");
    }

    if (this.openai.temperature < 0 || this.openai.temperature > 2) {
      errors.push("OPENAI_TEMPERATURE must be between 0 and 2");
    }

    if (this.commit.maxLength <= 0) {
      errors.push("COMMIT_MAX_LENGTH must be positive");
    }

    if (this.openai.maxTokens <= 0) {
      errors.push("OPENAI_MAX_TOKENS must be positive");
    }

    return errors;
  }
}

// Singleton instance
let configInstance = null;

export function getConfig() {
  if (!configInstance) {
    configInstance = new Config();
  }
  return configInstance;
}

export default getConfig;
