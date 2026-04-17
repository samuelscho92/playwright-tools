import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],

  // Snapshot baselines live alongside their spec files under __snapshots__/
  snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}{ext}',

  use: {
    baseURL: 'https://playwright.dev',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',

    // How long a single action (click, fill, etc.) may take
    actionTimeout: 10_000,

    // How long a navigation (goto, waitForURL) may take
    navigationTimeout: 30_000,
  },

  // Global per-test timeout
  timeout: 60_000,

  expect: {
    // How long an individual assertion may retry before failing
    timeout: 10_000,

    // Visual snapshot threshold: allow up to 0.2% pixel difference (anti-aliasing, font rendering)
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    },
  },

  projects: [
    // ─── 1. Auth setup ────────────────────────────────────────────────────────
    // Runs before the 'authenticated' project. Saves storageState to disk.
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // ─── 2. Cross-browser E2E ─────────────────────────────────────────────────
    // Session tests are excluded — they run under the 'authenticated' project.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/session/**', '**/auth.setup.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/session/**', '**/auth.setup.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/session/**', '**/auth.setup.ts'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: ['**/session/**', '**/auth.setup.ts'],
    },

    // ─── 3. Authenticated ─────────────────────────────────────────────────────
    // Loads persisted session from auth setup. Only picks up tests/session/**
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/state.json',
      },
      dependencies: ['setup'],
      testMatch: '**/session/**/*.spec.ts',
    },
  ],
});
