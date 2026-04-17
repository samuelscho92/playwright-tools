import { test as setup, expect } from '@playwright/test';
import fs from 'fs';

const authDir = 'playwright/.auth';
const authFile = `${authDir}/state.json`;

/**
 * Auth setup — runs once before the 'authenticated' project (see playwright.config.ts).
 *
 * playwright.dev has no real login flow, so this demonstrates the storageState pattern
 * by persisting a user preference (dark mode) to localStorage.
 *
 * In a real application, replace the body with a full login flow:
 *   await page.goto('/login');
 *   await page.getByLabel('Email').fill(process.env.TEST_USER!);
 *   await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
 *   await page.getByRole('button', { name: 'Sign in' }).click();
 *   await page.waitForURL('/dashboard');
 *   await page.context().storageState({ path: authFile });
 */
setup('persist user session to storage state', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  await page.goto('https://playwright.dev/');

  // Simulate state that would normally be set during login (e.g. auth cookie, user prefs)
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', role: 'admin' }));
  });

  // Persist cookies + localStorage + sessionStorage to disk for reuse in subsequent tests
  await page.context().storageState({ path: authFile });

  // Verify state was saved successfully
  const theme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(theme).toBe('dark');
});
