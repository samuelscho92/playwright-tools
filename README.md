# playwright-tools

A Playwright end-to-end test suite for [playwright.dev](https://playwright.dev), demonstrating best practices for functional, snapshot, and performance testing.

## Stack

- [Playwright](https://playwright.dev) — browser automation & test runner
- [TypeScript](https://www.typescriptlang.org)
- [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) — linting rules enforcing Playwright best practices

## Project structure

```
tests/
├── pages/
│   └── PlaywrightHomePage.ts          # Page Object Model
├── playwright-home.spec.ts            # Functional tests
├── playwright-home.snapshot.spec.ts   # Visual & ARIA snapshot tests
└── playwright-home.perf.spec.ts       # Performance tests
tests/snapshots/                       # Committed snapshot baselines
playwright.config.ts
eslint.config.mjs
```

## Getting started

```bash
npm install
npx playwright install
```

## Running tests

| Command | Description |
|---|---|
| `npm test` | Run all tests across all browsers |
| `npm run test:chromium` | Run all tests in Chromium only |
| `npm run test:headed` | Run with visible browser window |
| `npm run test:debug` | Open Playwright Inspector |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:snapshots` | Run snapshot tests against baseline |
| `npm run test:snapshots:update` | Regenerate snapshot baselines |
| `npm run test:perf` | Run performance tests |
| `npm run report` | Open the last HTML report |
| `npm run lint` | Lint test files |

## Test suites

### Functional (`playwright-home.spec.ts`)
Core behaviour tests: page title, hero content, navigation links, CTA routing, search, meta tags, and mobile layout.

### Snapshot (`playwright-home.snapshot.spec.ts`)
Two strategies:
- **Visual** (`toHaveScreenshot`) — pixel diffs of the full page, navbar, and hero at desktop / tablet / mobile viewports
- **ARIA** (`toMatchAriaSnapshot`) — semantic structure of the navbar, hero heading, and `<main>` landmark

Baseline images live in `tests/snapshots/` and are committed to source control. Regenerate them after intentional UI changes with `npm run test:snapshots:update`.

### Performance (`playwright-home.perf.spec.ts`)
Measures real browser timings using the Navigation Timing, Paint Timing, and PerformanceObserver APIs:

| Metric | Threshold |
|---|---|
| TTFB | < 800 ms |
| FCP | < 3 000 ms |
| LCP | < 4 000 ms |
| DOMContentLoaded | < 4 000 ms |
| Load | < 8 000 ms |
| CLS | < 0.25 |
| TBT | < 600 ms |
| Resources | < 150 requests |
| Transfer size | < 5 000 KB |

A slow-3G throttle test (400 kbps, 200 ms RTT) is also included via the Chrome DevTools Protocol.

## Browsers

Tests run against four projects by default:

- Chromium (Desktop Chrome)
- Firefox
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)

## Linting

[eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) is configured with rules that enforce:

- Web-first assertions (`toBeVisible` over `isVisible`)
- Locator-based selectors over element handles
- No hard-coded `waitForTimeout` calls
- No `force: true` option
- No raw CSS/XPath locators (prefer `getByRole`, `getByText`, etc.)
