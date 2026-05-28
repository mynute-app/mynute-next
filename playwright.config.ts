import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for automated screenshot testing.
 *
 * Targets /dev-preview/* route which renders all dashboard pages
 * with MSW mock data — no login required.
 *
 * Run: npm run test:screenshots
 */
export default defineConfig({
  testDir: "./tests/screenshots",
  outputDir: "./tests/screenshots/output",
  timeout: 30_000,
  retries: 1,
  workers: 2,

  use: {
    baseURL: "http://localhost:3000",
    // Give MSW time to initialize the service worker
    actionTimeout: 15_000,
    screenshot: "on",
    trace: "off",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  // Start dev server automatically if not already running
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
