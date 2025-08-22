// Example test file to demonstrate testing the refactored architecture
// This would typically use Jest or another testing framework

import { CommitGenerator } from "../core/CommitGenerator.js";
import { getConfig } from "../config/index.js";
import { GitService } from "../services/GitService.js";
import { Validator } from "../utils/Validator.js";

// Mock dependencies for testing
jest.mock("../services/GitService.js");
jest.mock("../config/index.js");

describe("CommitGenerator", () => {
  let commitGenerator;
  let mockGitService;
  let mockConfig;

  beforeEach(() => {
    // Setup mocks
    mockGitService = {
      validateGitRepository: jest.fn(),
      getStagedDiff: jest.fn(),
      hasStagedChanges: jest.fn(),
      commit: jest.fn(),
    };

    mockConfig = {
      validate: jest.fn().mockReturnValue([]),
      openai: {
        apiKey: "test-key",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 500,
      },
      commit: {
        maxLength: 72,
        defaultType: "chore",
        enableConventionalCommits: true,
      },
    };

    GitService.mockImplementation(() => mockGitService);
    getConfig.mockReturnValue(mockConfig);

    commitGenerator = new CommitGenerator();
  });

  describe("constructor", () => {
    it("should initialize with proper dependencies", () => {
      expect(commitGenerator.config).toBeDefined();
      expect(commitGenerator.gitService).toBeDefined();
      expect(commitGenerator.messageGenerator).toBeDefined();
      expect(commitGenerator.commandRegistry).toBeDefined();
    });
  });

  describe("validateEnvironment", () => {
    it("should validate git repository", () => {
      commitGenerator.validateEnvironment();
      expect(mockGitService.validateGitRepository).toHaveBeenCalled();
    });

    it("should validate configuration", () => {
      commitGenerator.validateEnvironment();
      expect(mockConfig.validate).toHaveBeenCalled();
    });

    it("should log configuration warnings", () => {
      const warnings = ["Warning 1", "Warning 2"];
      mockConfig.validate.mockReturnValue(warnings);

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      commitGenerator.validateEnvironment();

      expect(consoleSpy).toHaveBeenCalledWith("⚠️ Configuration warnings:");
      warnings.forEach((warning) => {
        expect(consoleSpy).toHaveBeenCalledWith(`  - ${warning}`);
      });

      consoleSpy.mockRestore();
    });
  });
});

describe("Validator", () => {
  describe("validatePositiveInteger", () => {
    it("should validate positive integers", () => {
      expect(Validator.validatePositiveInteger(5, "test")).toBe(5);
      expect(Validator.validatePositiveInteger("10", "test")).toBe(10);
    });

    it("should throw error for invalid values", () => {
      expect(() => Validator.validatePositiveInteger(0, "test")).toThrow();
      expect(() => Validator.validatePositiveInteger(-1, "test")).toThrow();
      expect(() => Validator.validatePositiveInteger("abc", "test")).toThrow();
    });
  });

  describe("validateString", () => {
    it("should validate non-empty strings", () => {
      expect(Validator.validateString("test", "test")).toBe("test");
      expect(Validator.validateString("  test  ", "test")).toBe("test");
    });

    it("should throw error for invalid values", () => {
      expect(() => Validator.validateString("", "test")).toThrow();
      expect(() => Validator.validateString(null, "test")).toThrow();
      expect(() => Validator.validateString(undefined, "test")).toThrow();
    });
  });
});

// Example of testing a command
describe("SimpleCommitCommand", () => {
  let command;
  let mockGitService;
  let mockMessageGenerator;

  beforeEach(() => {
    mockGitService = {
      getStagedDiff: jest.fn(),
      hasStagedChanges: jest.fn(),
      commit: jest.fn(),
    };

    mockMessageGenerator = {
      generate: jest.fn(),
    };

    command = new SimpleCommitCommand(mockGitService, mockMessageGenerator);
  });

  describe("canHandle", () => {
    it("should handle empty args", () => {
      expect(command.canHandle([])).toBe(true);
      expect(command.canHandle()).toBe(true);
    });

    it("should not handle non-empty args", () => {
      expect(command.canHandle(["-3"])).toBe(false);
      expect(command.canHandle(["help"])).toBe(false);
    });
  });

  describe("execute", () => {
    it("should execute successfully with staged changes", async () => {
      const diff = "test diff";
      const message = "test commit message";

      mockGitService.getStagedDiff.mockReturnValue(diff);
      mockGitService.hasStagedChanges.mockReturnValue(true);
      mockMessageGenerator.generate.mockResolvedValue(message);

      await command.execute([]);

      expect(mockGitService.getStagedDiff).toHaveBeenCalled();
      expect(mockGitService.hasStagedChanges).toHaveBeenCalled();
      expect(mockMessageGenerator.generate).toHaveBeenCalledWith(diff);
      expect(mockGitService.commit).toHaveBeenCalledWith(message, false);
    });

    it("should not execute when no staged changes", async () => {
      mockGitService.getStagedDiff.mockReturnValue("");
      mockGitService.hasStagedChanges.mockReturnValue(false);

      await command.execute([]);

      expect(mockGitService.getStagedDiff).toHaveBeenCalled();
      expect(mockGitService.hasStagedChanges).toHaveBeenCalled();
      expect(mockMessageGenerator.generate).not.toHaveBeenCalled();
      expect(mockGitService.commit).not.toHaveBeenCalled();
    });
  });
});
