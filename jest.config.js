export default {
  preset: "default",
  extensionsToTreatAsEsm: [".js"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapping: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.js", "**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/tests/**", "!src/**/*.test.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
};
