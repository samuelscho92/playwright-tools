import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for https://playwright.dev/
 * Encapsulates selectors and actions to keep tests readable and maintainable.
 */
export class PlaywrightHomePage {
  readonly page: Page;

  // Navigation
  readonly navbar: Locator;
  readonly docsLink: Locator;
  readonly apiLink: Locator;
  readonly mcpLink: Locator;

  // Hero section
  readonly heroHeading: Locator;
  readonly getStartedButton: Locator;

  // Search
  readonly searchButton: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navbar = page.getByRole('navigation');
    this.docsLink = page.getByRole('link', { name: 'Docs' });
    this.apiLink = page.getByRole('link', { name: 'API' });
    this.mcpLink = page.getByRole('link', { name: 'MCP', exact: true }).first();

    this.heroHeading = page.getByRole('heading', {
      name: /Playwright enables reliable web automation/i,
    });
    this.getStartedButton = page.getByRole('link', { name: 'Get started' }).first();

    this.searchButton = page.getByRole('button', { name: /search/i });
    this.themeToggle = page.getByRole('button', { name: /switch between dark and light mode/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async navigateToDocs() {
    await this.docsLink.click();
  }

  async openSearch() {
    await this.searchButton.click();
  }
}
