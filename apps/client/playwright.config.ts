import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Kept modest: a single dev server backs every worker, and running too many Chromium
  // instances at once on a constrained machine causes the browser sessions themselves to crash.
  workers: 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3010",
    trace: "retain-on-failure",
    // The app defaults to French, then re-renders in the browser's detected language once
    // mounted — pin it so the suite isn't racing that switch or asserting French copy in English.
    locale: "fr-FR"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
