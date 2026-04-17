import { test, expect } from '../fixtures/base.fixture';
import { PlaywrightHomePage } from '../pages/PlaywrightHomePage';

/**
 * Functional E2E tests for https://playwright.dev/
 *
 * `test` is imported from the custom fixture file — this gives every test a
 * pre-navigated `homePage` object via dependency injection. No boilerplate
 * `beforeEach` navigation needed; the fixture handles it automatically.
 */

test.describe('Playwright.dev homepage', () => {
  test.beforeEach(async ({ homePage: _ }) => {
    // Requesting `homePage` here ensures the fixture runs (navigates) for
    // every test in this describe block, even those that don't need POM methods.

    const annotationsByTitle: Record<string, { type: string; description: string }[]> = {
      'has correct page title': [
        { type: 'category', description: 'seo' },
        { type: 'description', description: 'Verifies the <title> tag contains "Playwright" for SEO and tab identification.' },
      ],
      'displays the hero heading': [
        { type: 'category', description: 'content' },
        { type: 'component', description: 'hero' },
        { type: 'description', description: 'Verifies the primary hero heading is rendered and visible above the fold.' },
      ],
      'has a working "Get started" CTA': [
        { type: 'category', description: 'navigation' },
        { type: 'component', description: 'hero' },
        { type: 'description', description: 'Clicks the primary CTA and asserts it lands on the installation docs page.' },
      ],
      'navigation bar contains expected links': [
        { type: 'category', description: 'navigation' },
        { type: 'component', description: 'navbar' },
        { type: 'description', description: 'Asserts all primary nav links (Docs, API, MCP) are present and visible.' },
      ],
      'Docs link navigates to documentation': [
        { type: 'category', description: 'navigation' },
        { type: 'component', description: 'navbar' },
        { type: 'description', description: 'Clicks the Docs nav link and confirms the URL moves to the /docs/ tree.' },
      ],
      'search button is accessible': [
        { type: 'category', description: 'accessibility' },
        { type: 'component', description: 'search' },
        { type: 'description', description: 'Verifies the search trigger button has an accessible name and is visible.' },
      ],
      'meta description is set': [
        { type: 'category', description: 'seo' },
        { type: 'description', description: 'Asserts the <meta name="description"> tag is present and non-empty.' },
      ],
    };

    const annotations = annotationsByTitle[test.info().title];
    if (annotations) test.info().annotations.push(...annotations);
  });

  test('has correct page title', async ({ homePage }) => {
    await expect(homePage.page).toHaveTitle(/Playwright/);
  });

  test('displays the hero heading', async ({ homePage }) => {
    await expect(homePage.heroHeading).toBeVisible();
  });

  test('has a working "Get started" CTA', async ({ homePage }) => {
    await homePage.clickGetStarted();
    await expect(homePage.page).toHaveURL(/\/docs\/intro/);
    await expect(homePage.page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('navigation bar contains expected links', async ({ homePage }) => {
    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.docsLink).toBeVisible();
    await expect(homePage.apiLink).toBeVisible();
    await expect(homePage.mcpLink).toBeVisible();
  });

  test('Docs link navigates to documentation', async ({ homePage }) => {
    await homePage.navigateToDocs();
    await expect(homePage.page).toHaveURL(/\/docs\//);
  });

  test('search button is accessible', async ({ homePage }) => {
    await expect(homePage.searchButton).toBeVisible();
  });

  test('meta description is set', async ({ homePage }) => {
    // eslint-disable-next-line playwright/no-raw-locators -- no semantic selector exists for <meta> tags
    const metaDescription = homePage.page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });
});

test.describe('Playwright.dev responsive layout', () => {
  test.beforeEach(() => {
    test.info().annotations.push(
      { type: 'category', description: 'responsive' },
      { type: 'viewport', description: '375x812' },
      { type: 'description', description: 'Confirms the hero heading is visible on a 375px-wide mobile viewport.' },
    );
  });

  // This test sets viewport before navigation, so it manages its own page setup
  // rather than using the homePage fixture (which navigates at the default viewport).
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
    await expect(homePage.heroHeading).toBeVisible();
  });
});
