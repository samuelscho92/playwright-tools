import playwrightPlugin from 'eslint-plugin-playwright';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ...playwrightPlugin.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'tests/**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...playwrightPlugin.configs['flat/recommended'].rules,

      // Enforce awaiting async Playwright actions
      'playwright/no-force-option': 'error',

      // Disallow using element handles — prefer locators
      'playwright/no-element-handle': 'error',

      // Require assertions to have a message for easier debugging
      'playwright/prefer-comparison-matcher': 'warn',
      'playwright/prefer-equality-matcher': 'warn',

      // Prevent hard-coded waits (use auto-waiting instead)
      'playwright/no-wait-for-timeout': 'error',

      // Enforce using web-first assertions (toBeVisible, etc.)
      'playwright/prefer-web-first-assertions': 'error',

      // Disallow raw page.$() / page.$$() in favor of locators
      'playwright/no-raw-locators': 'warn',

      // Disallow skipping tests without a reason
      'playwright/no-skipped-test': 'warn',

      // Prevent duplicate test titles
      'playwright/no-duplicate-hooks': 'error',

      // Require locators to be assigned before calling actions
      'playwright/missing-playwright-await': 'error',
    },
  },
];
