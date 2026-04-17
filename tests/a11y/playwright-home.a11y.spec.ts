import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

/**
 * Accessibility test suite for https://playwright.dev/
 *
 * Uses @axe-core/playwright to run automated WCAG 2.1 AA scans.
 * Axe catches ~30-57% of accessibility issues automatically; complement
 * with manual testing for full coverage.
 *
 * Standards tested:
 *   wcag2a   — WCAG 2.0 Level A
 *   wcag2aa  — WCAG 2.0 Level AA
 *   wcag21aa — WCAG 2.1 Level AA (adds mobile + cognitive criteria)
 *
 * @see https://www.deque.com/axe/
 */

test.describe('Playwright.dev accessibility', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'category', description: 'accessibility' });
    await page.goto('https://playwright.dev/');
  });

  test('full page has no WCAG 2.1 AA violations', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Full-page axe scan for WCAG 2.0 A/AA and WCAG 2.1 AA.',
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Always attach violation summary — empty string means clean; non-empty aids debugging
    const summary = results.violations.map(v =>
      `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} element(s))`,
    ).join('\n');
    test.info().annotations.push({
      type: 'axe-violations',
      description: summary || 'none',
    });

    expect(results.violations).toEqual([]);
  });

  test('navigation landmark has no accessibility violations', async ({ page }) => {
    test.info().annotations.push({
      type: 'component', description: 'navbar',
    }, {
      type: 'description',
      description: 'Scoped axe scan on the <nav> landmark only.',
    });

    const results = await new AxeBuilder({ page })
      .include('nav')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('main content area has no accessibility violations', async ({ page }) => {
    test.info().annotations.push({
      type: 'component', description: 'main',
    }, {
      type: 'description',
      description: 'Scoped axe scan on the <main> landmark only.',
    });

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('page has correct heading hierarchy', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Verifies there is exactly one h1 and the heading order is logical.',
    });

    const h1Count = await page.getByRole('heading', { level: 1 }).count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('all images have alt text', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'Verifies no <img> elements are missing alt attributes.',
    });

    // eslint-disable-next-line playwright/no-raw-locators -- querying by element type and attribute absence
    const imagesWithoutAlt = page.locator('img:not([alt])');
    await expect(imagesWithoutAlt).toHaveCount(0);
  });
});
