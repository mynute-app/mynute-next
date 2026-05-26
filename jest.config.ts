import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Points to the Next.js app directory for loading next.config.mjs and .env files
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Use 4 workers to parallelize the suite and avoid timeouts on full runs.
  // NEVER set maxWorkers to 1 (equivalent to --runInBand) for the full suite.
  maxWorkers: 4,
  moduleNameMapper: {
    // Handle @/ path alias — matches tsconfig paths where baseUrl is ./src and @/* -> ./*
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.{ts,tsx}",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  // Exclude Playwright test files from Jest
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/screenshots/",
    "<rootDir>/src/__tests__/helpers/",
  ],
};

// createJestConfig wraps config to ensure Next.js can load assets and use SWC transpiler
export default createJestConfig(config);
