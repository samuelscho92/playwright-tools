# playwright-tools

An enterprise-grade Playwright test suite for [playwright.dev](https://playwright.dev), demonstrating production-ready patterns across six testing disciplines.

## Stack

- [Playwright](https://playwright.dev) — browser automation & test runner
- [TypeScript](https://www.typescriptlang.org)
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — accessibility scanning (WCAG 2.1 AA)
- [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) — Playwright-specific lint rules

## Project structure

```
tests/
├── pages/                              # Page Object Models
│   └── PlaywrightHomePage.ts
├── fixtures/                           # Custom fixtures & auth setup
│   ├── base.fixture.ts                 # Extended test with homePage fixture
│   └── auth.setup.ts                   # Persists storageState for session tests
├── data/                               # Static test data (JSON)
│   └── booking.json
├── e2e/                                # Cross-browser functional tests
│   └── playwright-home.spec.ts
├── visual/                             # Visual regression + ARIA snapshots
│   ├── playwright-home.snapshot.spec.ts
│   └── __snapshots__/                  # Committed baselines
├── perf/                               # Performance / Core Web Vitals
│   └── playwright-home.perf.spec.ts
├── api/                                # REST API + hybrid API+UI
│   ├── restful-booker.spec.ts
│   └── hybrid.spec.ts
├── a11y/                               # Accessibility (axe-core)
│   └── playwright-home.a11y.spec.ts
└── session/                            # storageState / auth session
    └── session.spec.ts
playwright/.auth/                       # Persisted session state (gitignored)
.github/workflows/playwright.yml        # CI/CD pipeline
CLAUDE.md                               # AI agent conventions guide
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
| `npm run test:e2e` | Functional E2E tests (Chromium) |
| `npm run test:visual` | Visual + ARIA snapshot tests |
| `npm run test:visual:update` | Regenerate snapshot baselines |
| `npm run test:perf` | Performance / Core Web Vitals |
| `npm run test:api` | REST API + hybrid tests |
| `npm run test:a11y` | Accessibility (axe-core WCAG 2.1 AA) |
| `npm run test:session` | Auth/session storageState tests |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Playwright Inspector |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open HTML report |
| `npm run lint` | Lint test files |

## Test suites

### 1. Enterprise UI Framework (`tests/e2e/`)
Functional tests using the **Page Object Model** and **custom Playwright Fixtures**.

- `test` is imported from `tests/fixtures/base.fixture.ts` which auto-injects a pre-navigated `homePage` object — no boilerplate navigation in every test
- Tests run across **4 browser projects**: Chromium, Firefox, WebKit, Mobile Chrome

### 2. Hybrid UI & API (`tests/api/`)
Combines Playwright's `request` fixture for API calls with `page` for UI verification.

- `restful-booker.spec.ts` — full CRUD lifecycle against [Restful Booker](https://restful-booker.herokuapp.com): auth, create, read, update, delete, verify 404
- `hybrid.spec.ts` — fetches authoritative data from the GitHub API and npm registry, then verifies the same data appears correctly in the UI

### 3. CI/CD Pipeline (`.github/workflows/playwright.yml`)
GitHub Actions workflow triggered on every push and pull request to `main`:

- Installs Node.js (LTS) and npm dependencies
- Installs Playwright browsers with OS dependencies
- Runs the full test suite
- Uploads the HTML report as a downloadable artifact (30-day retention)
- Uploads traces on failure (7-day retention)

### 4. Visual & Accessibility Testing

**Visual regression** (`tests/visual/`) — two snapshot strategies:
- `toHaveScreenshot` — pixel diffs of full page, navbar, hero at desktop / tablet / mobile viewports
- `toMatchAriaSnapshot` — semantic ARIA tree assertions for nav, heading, and main landmark

Snapshot baselines are committed in `tests/visual/__snapshots__/`. Regenerate after intentional changes with `npm run test:visual:update`.

**Accessibility** (`tests/a11y/`) — axe-core WCAG 2.1 AA scans:
- Full-page scan
- Scoped scans on `<nav>` and `<main>` landmarks
- Heading hierarchy validation
- Image alt-text audit

### 5. Auth / Session (`tests/session/`)
Demonstrates Playwright's **storageState** pattern for session reuse:

1. `tests/fixtures/auth.setup.ts` runs first (via the `setup` project dependency), saving `localStorage` + cookies to `playwright/.auth/state.json`
2. The `authenticated` project loads that state before every session test — no re-login required
3. Tests verify the persisted data is correctly restored across navigations

In a real app, replace the localStorage demo with a full login flow (form fill → submit → wait for redirect → save state).

### 6. Performance (`tests/perf/`)
Measures real browser timings via Navigation Timing, Paint Timing, and PerformanceObserver:

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

Includes a slow-3G throttle test (400 kbps, 200 ms RTT) via Chrome DevTools Protocol.

## Browser projects

| Project | Scope |
|---|---|
| `chromium` | All tests except session |
| `firefox` | All tests except session |
| `webkit` | All tests except session |
| `mobile-chrome` | All tests except session |
| `setup` | `auth.setup.ts` only (runs before `authenticated`) |
| `authenticated` | `tests/session/**` only, loads `playwright/.auth/state.json` |

## Timeouts

| Config key | Value | Scope |
|---|---|---|
| `timeout` | 60 s | Per test |
| `expect.timeout` | 10 s | Per assertion retry |
| `actionTimeout` | 10 s | Per action (click, fill, etc.) |
| `navigationTimeout` | 30 s | Per navigation |

## Linting

`eslint-plugin-playwright` enforces:

- Web-first assertions (`toBeVisible` over `isVisible`)
- Locator-based selectors (no element handles)
- No hard-coded `waitForTimeout`
- No `force: true`
- No raw CSS/XPath locators (prefer `getByRole`, `getByText`, etc.)

## AI / MCP

This project includes a [`CLAUDE.md`](./CLAUDE.md) with conventions for AI coding agents. It also documents how to set up the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) for LLM-driven browser control alongside this suite.
