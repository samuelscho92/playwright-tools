import { test, expect } from '@playwright/test';
import { PlaywrightHomePage } from './pages/PlaywrightHomePage';

/**
 * Snapshot test suite for https://playwright.dev/
 *
 * Two snapshot strategies are used:
 *   1. Visual (pixel) snapshots  — toHaveScreenshot()
 *      Catches unintended visual regressions (layout shifts, broken styles).
 *      Snapshots are stored under tests/snapshots/ and committed to source control.
 *      Re-generate with: npm run test:snapshots:update
 *
 *   2. Accessibility (ARIA) snapshots — toMatchAriaSnapshot()
 *      Asserts the semantic/accessible structure of a region, independent of
 *      visual styling. Faster and less flaky than pixel diffs for structure checks.
 */

test.describe('Playwright.dev visual snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Shared annotation: all tests in this block are visual regression checks
    test.info().annotations.push({ type: 'category', description: 'visual' });

    // Per-test component annotations keyed by title
    const componentByTitle: Record<string, string> = {
      'navbar matches snapshot': 'navbar',
      'hero section matches snapshot': 'hero',
    };
    const component = componentByTitle[test.info().title];
    if (component) test.info().annotations.push({ type: 'component', description: component });

    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
    // Wait for load so animations complete before capturing
    await page.waitForLoadState('load');
  });

  test('full page matches snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('full-page.png', { fullPage: true });
  });

  test('navbar matches snapshot', async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await expect(homePage.navbar).toHaveScreenshot('navbar.png');
  });

  test('hero section matches snapshot', async ({ page }) => {
    // eslint-disable-next-line playwright/no-raw-locators -- no semantic role covers the hero container element
    const hero = page.locator('header, [class*="hero"], main > :first-child').first();
    await expect(hero).toHaveScreenshot('hero.png');
  });
});

test.describe('Playwright.dev ARIA snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Shared annotation: all tests in this block are accessibility checks
    test.info().annotations.push({ type: 'category', description: 'accessibility' });

    // Per-test component annotations keyed by title
    const componentByTitle: Record<string, string> = {
      'navbar ARIA structure matches snapshot': 'navbar',
      'hero heading ARIA structure matches snapshot': 'hero',
    };
    const component = componentByTitle[test.info().title];
    if (component) test.info().annotations.push({ type: 'component', description: component });

    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
  });

  test('navbar ARIA structure matches snapshot', async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await expect(homePage.navbar).toMatchAriaSnapshot();
  });

  test('hero heading ARIA structure matches snapshot', async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await expect(homePage.heroHeading).toMatchAriaSnapshot();
  });

  test('main landmark ARIA structure matches snapshot', async ({ page }) => {
    await expect(page.getByRole('main')).toMatchAriaSnapshot();
  });
});

test.describe('Playwright.dev responsive visual snapshots', () => {
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ] as const;

  test.beforeEach(async ({ page }) => {
    // Shared annotation: category is visual for all responsive tests
    test.info().annotations.push({ type: 'category', description: 'visual' });

    // Parse the viewport dimensions directly from the test title, e.g. "(1440x900)"
    const match = test.info().title.match(/\((\d+x\d+)\)/);
    if (match) test.info().annotations.push({ type: 'viewport', description: match[1] });

    // Viewport sizing and navigation happen in each test since dimensions differ
  });

  for (const viewport of viewports) {
    test(`hero matches snapshot at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const homePage = new PlaywrightHomePage(page);
      await homePage.goto();
      await page.waitForLoadState('load');

      // eslint-disable-next-line playwright/no-raw-locators -- no semantic role covers the hero container element
      const hero = page.locator('header, [class*="hero"], main > :first-child').first();
      await expect(hero).toHaveScreenshot(`hero-${viewport.name}.png`);
    });
  }
});
