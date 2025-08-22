// Test setup file for Jest
// This file runs before each test file

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Mock process.exit to prevent tests from actually exiting
process.exit = jest.fn();

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.OPENAI_API_KEY = "test-key";
process.env.OPENAI_MODEL = "gpt-3.5-turbo";
process.env.OPENAI_TEMPERATURE = "0.7";
process.env.OPENAI_MAX_TOKENS = "500";
process.env.COMMIT_MAX_LENGTH = "72";
process.env.COMMIT_DEFAULT_TYPE = "chore";
process.env.ENABLE_CONVENTIONAL_COMMITS = "true";
