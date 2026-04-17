import { test as base, expect } from '@playwright/test';
import { PlaywrightHomePage } from '../pages/PlaywrightHomePage';

type AppFixtures = {
  /** Pre-instantiated PlaywrightHomePage, already navigated to the baseURL root. */
  homePage: PlaywrightHomePage;
};

/**
 * Extended test object with app-specific fixtures.
 *
 * Import `test` from this file (instead of `@playwright/test`) to get
 * page objects injected automatically — no boilerplate in every spec.
 *
 * @example
 * import { test, expect } from '../fixtures/base.fixture';
 * test('hero is visible', async ({ homePage }) => {
 *   await expect(homePage.heroHeading).toBeVisible();
 * });
 */
export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
    await use(homePage);
  },
});

export { expect };
