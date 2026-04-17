import { test, expect } from '@playwright/test';
import { PlaywrightHomePage } from './pages/PlaywrightHomePage';

/**
 * Performance test suite for https://playwright.dev/
 *
 * Measures real browser timings using the Navigation Timing, Paint Timing,
 * and PerformanceObserver APIs. Thresholds are intentionally lenient to stay
 * stable in CI (network variance, shared runners). Tighten per environment.
 *
 * Metrics collected:
 *   - TTFB  (Time to First Byte)      — server responsiveness
 *   - FCP   (First Contentful Paint)  — when first content appears
 *   - LCP   (Largest Contentful Paint)— when main content is ready
 *   - DOMContentLoaded                — HTML parsed, scripts deferred
 *   - Load                            — all resources fetched
 *   - CLS   (Cumulative Layout Shift) — visual stability
 *   - TBT   (Total Blocking Time)     — main-thread blocking (proxy for FID/INP)
 *   - Resource count & transfer size  — payload audit
 */

/** Thresholds (milliseconds unless noted) */
const THRESHOLDS = {
  ttfb: 800,
  fcp: 3000,
  lcp: 4000,
  domContentLoaded: 4000,
  load: 8000,
  cls: 0.25,       // score (unitless)
  tbt: 600,
  maxResources: 150,
  maxTransferKB: 5000,
} as const;

type PerfMetrics = {
  ttfb: number;
  fcp: number | null;
  domContentLoaded: number;
  load: number;
};

type AdvancedMetrics = {
  lcp: number | null;
  cls: number;
  tbt: number;
  resourceCount: number;
  transferSizeKB: number;
};

test.describe('Playwright.dev performance', () => {
  test.beforeEach(() => {
    test.info().annotations.push({ type: 'category', description: 'performance' });
  });

  test('Navigation Timing metrics are within thresholds', async ({ page }) => {
    test.info().annotations.push(
      { type: 'metrics', description: 'TTFB, FCP, DOMContentLoaded, Load' },
    );

    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
    await page.waitForLoadState('load');

    const metrics = await page.evaluate((): PerfMetrics => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return {
        ttfb: nav.responseStart - nav.requestStart,
        fcp: fcp ? fcp.startTime : null,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        load: nav.loadEventEnd - nav.startTime,
      };
    });

    test.info().annotations.push(
      { type: 'result:ttfb', description: `${metrics.ttfb.toFixed(0)}ms` },
      { type: 'result:fcp', description: metrics.fcp != null ? `${metrics.fcp.toFixed(0)}ms` : 'unavailable' },
      { type: 'result:domContentLoaded', description: `${metrics.domContentLoaded.toFixed(0)}ms` },
      { type: 'result:load', description: `${metrics.load.toFixed(0)}ms` },
    );

    expect(metrics.ttfb, `TTFB should be < ${THRESHOLDS.ttfb}ms`).toBeLessThan(THRESHOLDS.ttfb);
    // eslint-disable-next-line playwright/no-conditional-in-test -- FCP is legitimately unavailable in some browser/headless configs
    if (metrics.fcp != null) {
      // eslint-disable-next-line playwright/no-conditional-expect
      expect(metrics.fcp, `FCP should be < ${THRESHOLDS.fcp}ms`).toBeLessThan(THRESHOLDS.fcp);
    }
    expect(metrics.domContentLoaded, `DOMContentLoaded should be < ${THRESHOLDS.domContentLoaded}ms`).toBeLessThan(THRESHOLDS.domContentLoaded);
    expect(metrics.load, `Load should be < ${THRESHOLDS.load}ms`).toBeLessThan(THRESHOLDS.load);
  });

  test('Web Vitals (LCP, CLS, TBT) are within thresholds', async ({ page }) => {
    test.info().annotations.push(
      { type: 'metrics', description: 'LCP, CLS, TBT' },
    );

    // Inject PerformanceObservers before navigation so no entries are missed
    await page.addInitScript(() => {
      (window as Window & { __lcp?: number; __cls?: number; __tbt?: number }).__lcp = 0;
      (window as Window & { __lcp?: number; __cls?: number; __tbt?: number }).__cls = 0;
      (window as Window & { __lcp?: number; __cls?: number; __tbt?: number }).__tbt = 0;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as Window & { __lcp?: number }).__lcp = entry.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            (window as Window & { __cls?: number }).__cls =
              ((window as Window & { __cls?: number }).__cls ?? 0) + layoutShift.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const longTask = entry as PerformanceEntry & { duration: number };
          const blocking = Math.max(0, longTask.duration - 50);
          (window as Window & { __tbt?: number }).__tbt =
            ((window as Window & { __tbt?: number }).__tbt ?? 0) + blocking;
        }
      }).observe({ type: 'longtask', buffered: true });
    });

    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
    await page.waitForLoadState('load');
    // Allow PerformanceObserver callbacks to flush after load
    await page.evaluate(() => new Promise<void>(resolve => setTimeout(resolve, 500)));

    const metrics = await page.evaluate((): AdvancedMetrics => {
      const w = window as Window & { __lcp?: number; __cls?: number; __tbt?: number };
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const transferSizeKB = resources.reduce((sum, r) => sum + (r.transferSize ?? 0), 0) / 1024;
      return {
        lcp: w.__lcp ?? null,
        cls: w.__cls ?? 0,
        tbt: w.__tbt ?? 0,
        resourceCount: resources.length,
        transferSizeKB: Math.round(transferSizeKB),
      };
    });

    test.info().annotations.push(
      { type: 'result:lcp', description: metrics.lcp != null ? `${metrics.lcp.toFixed(0)}ms` : 'unavailable' },
      { type: 'result:cls', description: metrics.cls.toFixed(4) },
      { type: 'result:tbt', description: `${metrics.tbt.toFixed(0)}ms` },
      { type: 'result:resources', description: `${metrics.resourceCount} requests` },
      { type: 'result:transferSize', description: `${metrics.transferSizeKB} KB` },
    );

    // eslint-disable-next-line playwright/no-conditional-in-test -- LCP is legitimately unavailable in some browser/headless configs
    if (metrics.lcp != null) {
      // eslint-disable-next-line playwright/no-conditional-expect
      expect(metrics.lcp, `LCP should be < ${THRESHOLDS.lcp}ms`).toBeLessThan(THRESHOLDS.lcp);
    }
    expect(metrics.cls, `CLS should be < ${THRESHOLDS.cls}`).toBeLessThan(THRESHOLDS.cls);
    expect(metrics.tbt, `TBT should be < ${THRESHOLDS.tbt}ms`).toBeLessThan(THRESHOLDS.tbt);
    expect(metrics.resourceCount, `Resource count should be < ${THRESHOLDS.maxResources}`).toBeLessThan(THRESHOLDS.maxResources);
    expect(metrics.transferSizeKB, `Transfer size should be < ${THRESHOLDS.maxTransferKB}KB`).toBeLessThan(THRESHOLDS.maxTransferKB);
  });

  test('page loads within budget on simulated slow 3G', async ({ browser }) => {
    test.info().annotations.push(
      { type: 'network', description: 'Slow 3G (400kbps down, 400kbps up, 200ms RTT)' },
      { type: 'metrics', description: 'Load time under throttled network' },
    );

    const context = await browser.newContext();
    const page = await context.newPage();

    // Simulate Slow 3G via Chrome DevTools Protocol
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (400 * 1024) / 8,  // 400 kbps → bytes/s
      uploadThroughput: (400 * 1024) / 8,
      latency: 200,
    });

    const start = Date.now();
    await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });
    const domContentLoaded = Date.now() - start;

    test.info().annotations.push(
      { type: 'result:domContentLoaded@slow3G', description: `${domContentLoaded}ms` },
    );

    // DOMContentLoaded budget is generous on throttled network
    expect(domContentLoaded, 'DOMContentLoaded on Slow 3G should be < 30s').toBeLessThan(30_000);

    await context.close();
  });
});
