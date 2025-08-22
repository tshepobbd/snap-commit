export class CommitGenError extends Error {
  constructor(message, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "CommitGenError";
    this.code = code;
  }
}

export class ConfigurationError extends CommitGenError {
  constructor(message) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

export class GitError extends CommitGenError {
  constructor(message) {
    super(message, "GIT_ERROR");
    this.name = "GitError";
  }
}

export class OpenAIError extends CommitGenError {
  constructor(message) {
    super(message, "OPENAI_ERROR");
    this.name = "OpenAIError";
  }
}

export class ValidationError extends CommitGenError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export function handleError(error) {
  if (error instanceof CommitGenError) {
    console.error(`❌ ${error.name}: ${error.message}`);
  } else {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  if (process.env.NODE_ENV === "development") {
    console.error(error.stack);
  }

  process.exit(1);
}
