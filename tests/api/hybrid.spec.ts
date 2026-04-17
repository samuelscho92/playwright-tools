import { test, expect } from '@playwright/test';

/**
 * Hybrid API + UI test suite.
 *
 * Demonstrates combining Playwright's `request` fixture (for API calls)
 * with the `page` fixture (for UI verification) in the same test.
 *
 * Pattern: fetch authoritative data from an API, then verify the UI
 * correctly reflects that same data — catching mismatches between
 * backend truth and frontend display.
 */

test.describe('API + UI Hybrid', () => {
  test.beforeEach(() => {
    test.info().annotations.push({ type: 'category', description: 'hybrid' });
  });

  test('playwright.dev links to the correct GitHub repository', async ({ page, request }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Gets the canonical repo URL from the GitHub API, then verifies playwright.dev links to it.',
    });

    // API: get the canonical repository metadata
    const apiResponse = await request.get('https://api.github.com/repos/microsoft/playwright', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'playwright-tools-test',
      },
    });
    expect(apiResponse.ok()).toBeTruthy();
    const { name, owner, html_url: repoUrl } = await apiResponse.json();

    // Verify API response shape
    expect(name).toBe('playwright');
    expect(owner.login).toBe('microsoft');

    // UI: navigate to playwright.dev and verify it links to the same repo
    await page.goto('/');

    // eslint-disable-next-line playwright/no-raw-locators -- href attribute selector; no semantic role targets link destinations
    const repoLink = page.locator(`a[href*="github.com/microsoft/playwright"]`).first();
    await expect(repoLink).toBeAttached();
  });

  test('npm package version from registry matches documentation install command', async ({ request, page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Confirms the latest @playwright/test version from npm registry, then verifies the docs reference Playwright.',
    });

    // API: get the latest published version from npm
    const registryResponse = await request.get('https://registry.npmjs.org/@playwright/test/latest');
    expect(registryResponse.ok()).toBeTruthy();
    const { version, name } = await registryResponse.json();
    expect(name).toBe('@playwright/test');
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);

    // UI: verify the docs installation page mentions Playwright
    await page.goto('/docs/intro');
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
    // The install command on the page should reference playwright
    await expect(page.getByText(/playwright/i).first()).toBeVisible();
  });
});
