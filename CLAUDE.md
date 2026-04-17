# Claude Code — playwright-tools

This file gives AI coding agents (Claude, Copilot, Cursor, etc.) the conventions and context needed to contribute to this Playwright test suite correctly.

## Project overview

Enterprise-grade Playwright test suite covering functional E2E, visual regression, accessibility, performance, API, and session testing for [playwright.dev](https://playwright.dev).

## Folder structure

```
tests/
├── pages/        Page Object Models — locators and actions only, no assertions
├── fixtures/     Custom Playwright fixtures and auth setup
├── data/         Static test data (JSON)
├── e2e/          Cross-browser functional UI tests
├── visual/       Visual regression + ARIA snapshots
│   └── __snapshots__/  Committed baseline files
├── perf/         Performance / Core Web Vitals
├── api/          REST API tests + hybrid API+UI
├── a11y/         Axe-core accessibility scans
└── session/      storageState / auth session tests
```

## Conventions

### Imports
- E2E tests: import `test` from `'../fixtures/base.fixture'` (not from `@playwright/test`) to get the `homePage` fixture
- All other tests: import from `@playwright/test` directly

### Page Objects
- Keep page objects in `tests/pages/`
- Only locators and actions — no assertions in page objects
- Use `getByRole`, `getByLabel`, `getByText` — avoid CSS/XPath

### Fixtures
- `homePage` fixture: pre-navigated `PlaywrightHomePage` instance, available via `base.fixture.ts`
- `auth.setup.ts`: saves storageState; add new setup steps here for real login flows

### Annotations
- All tests must push at least `{ type: 'category', description: '<value>' }` in `beforeEach`
- Per-test annotations go in a `title → annotations[]` map inside `beforeEach`, not in test bodies
- Valid categories: `e2e`, `visual`, `accessibility`, `performance`, `api`, `hybrid`, `session`, `seo`, `responsive`, `content`, `navigation`

### Snapshots
- Visual baselines live in `tests/visual/__snapshots__/`
- ARIA snapshots also live in `tests/visual/__snapshots__/`
- Regenerate with: `npm run test:visual:update`
- Always commit baseline changes in a dedicated commit with context

### Linting rules enforced
- No `force: true` on actions
- No element handles (use locators)
- No `waitForTimeout` (use web-first assertions)
- No `networkidle` (use `load` or `domcontentloaded`)
- No raw `page.locator('css')` — use semantic locators; suppress with `eslint-disable` + reason comment when no semantic alternative exists

## npm scripts

| Script | What it runs |
|---|---|
| `npm test` | All tests, all browsers |
| `npm run test:e2e` | E2E tests, Chromium |
| `npm run test:visual` | Visual snapshots |
| `npm run test:visual:update` | Regenerate baselines |
| `npm run test:perf` | Performance |
| `npm run test:api` | API + hybrid |
| `npm run test:a11y` | Accessibility |
| `npm run test:session` | Auth/session (runs setup first) |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:debug` | Playwright Inspector |
| `npm run lint` | ESLint |
| `npm run report` | Open HTML report |

## Playwright MCP Server

The [Playwright MCP server](https://github.com/microsoft/playwright-mcp) lets LLMs control a browser directly for testing and automation tasks.

### Setup
```bash
npx @playwright/mcp@latest
```

### Claude Code integration
Add to your MCP config (`~/.claude/mcp.json` or project-level):
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### What it enables
- AI agents can navigate, click, type, and take screenshots
- Useful for exploratory test generation: navigate a page and auto-generate locators
- Can run alongside this suite to debug flaky tests interactively

## Adding new tests

1. Identify the category: e2e / visual / api / a11y / perf / session
2. Add the spec file to the matching folder
3. Import the correct `test` object (fixture for e2e, base for others)
4. Add `beforeEach` with annotations
5. Run `npm run lint` before committing
6. For visual tests: run `npm run test:visual:update` to generate baselines, commit them
