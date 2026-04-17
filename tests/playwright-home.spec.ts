import { test, expect } from '@playwright/test';
import { PlaywrightHomePage } from './pages/PlaywrightHomePage';

test.describe('Playwright.dev homepage', () => {
  let homePage: PlaywrightHomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new PlaywrightHomePage(page);
    await homePage.goto();

    // Annotations that differ per test — keyed by title so they stay out of test bodies
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

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('displays the hero heading', async () => {
    await expect(homePage.heroHeading).toBeVisible();
  });

  test('has a working "Get started" CTA', async ({ page }) => {
    await homePage.clickGetStarted();
    await expect(page).toHaveURL(/\/docs\/intro/);
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('navigation bar contains expected links', async () => {
    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.docsLink).toBeVisible();
    await expect(homePage.apiLink).toBeVisible();
    await expect(homePage.mcpLink).toBeVisible();
  });

  test('Docs link navigates to documentation', async ({ page }) => {
    await homePage.navigateToDocs();
    await expect(page).toHaveURL(/\/docs\//);
  });

  test('search button is accessible', async () => {
    await expect(homePage.searchButton).toBeVisible();
  });

  test('meta description is set', async ({ page }) => {
    // eslint-disable-next-line playwright/no-raw-locators -- no semantic selector exists for <meta> tags
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });
});

test.describe('Playwright.dev responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push(
      { type: 'category', description: 'responsive' },
      { type: 'viewport', description: '375x812' },
      { type: 'description', description: 'Confirms the hero heading is visible on a 375px-wide mobile viewport.' },
    );
    await page.setViewportSize({ width: 375, height: 812 });
    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
  });

  test('renders correctly on mobile viewport', async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await expect(homePage.heroHeading).toBeVisible();
  });
});
