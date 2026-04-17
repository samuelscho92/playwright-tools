import { test, expect } from '@playwright/test';

/**
 * Session / storageState tests.
 *
 * These run under the 'authenticated' project (see playwright.config.ts),
 * which depends on the 'setup' project running tests/fixtures/auth.setup.ts first.
 *
 * The setup saves cookies + localStorage + sessionStorage to playwright/.auth/state.json.
 * The 'authenticated' project loads that state before every test, simulating a
 * returning user without re-running the login flow.
 *
 * In a real app:
 *   - auth.setup.ts  →  fills login form, submits, saves storageState
 *   - session.spec.ts →  verifies protected pages are accessible without re-login
 */

test.describe('Authenticated user session', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'category', description: 'session' });
    await page.goto('https://playwright.dev/');
  });

  test('persisted theme preference is restored from storage state', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Verifies localStorage values from auth.setup.ts are present without re-running setup.',
    });

    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });

  test('persisted user data is restored from storage state', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Verifies complex stored objects (user profile) are correctly restored.',
    });

    const raw = await page.evaluate(() => localStorage.getItem('user'));
    expect(raw).not.toBeNull();
    const user = JSON.parse(raw!);
    expect(user.name).toBe('Test User');
    expect(user.role).toBe('admin');
  });

  test('session persists across navigation', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Confirms storageState survives a same-origin navigation (no re-login required).',
    });

    // Navigate away and back
    await page.goto('https://playwright.dev/docs/intro');
    await page.goto('https://playwright.dev/');

    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });
});
