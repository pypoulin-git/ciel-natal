import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for ciel-natal smoke + regression tests.
 * Runs against a local dev server on port 3335.
 * CI runs against the Vercel preview URL via BASE_URL env var.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3335",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3335",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
