/**
 * Performance Load Testing with Playwright
 * 
 * These E2E tests measure real-world performance under load:
 * - Core Web Vitals (LCP, FID, CLS)
 * - Network performance
 * - Resource loading
 * - User flow performance
 */

import { test, expect } from '@playwright/test';

describe('Performance Load Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Homepage should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should achieve good LCP score on homepage', async ({ page }) => {
    const metrics = await gotoAndWaitForMetrics(page, '/');

    // LCP should be under 2.5 seconds (good rating)
    expect(metrics.lcp).toBeLessThan(2500);
  });

  test('should maintain stable CLS on homepage', async ({ page }) => {
    const metrics = await gotoAndWaitForMetrics(page, '/');

    // CLS should be under 0.1 (good rating)
    expect(metrics.cls).toBeLessThan(0.1);
  });

  test('should respond quickly to user interactions (FID)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click a button and measure input delay
    const startTime = performance.now();
    
    await page.click('button:not([disabled])');
    
    const endTime = performance.now();
    const fid = endTime - startTime;

    // FID should be under 100ms (good rating)
    expect(fid).toBeLessThan(100);
  });

  test('should load dashboard efficiently', async ({ page }) => {
    // Login first (this would need actual auth implementation)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const metrics = await getWebVitals(page);

    expect(metrics.lcp).toBeLessThan(2500);
    expect(metrics.cls).toBeLessThan(0.1);
  });

  test('should handle concurrent requests efficiently', async ({ context }) => {
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    const startTime = Date.now();

    await Promise.all(
      pages.map(page => page.goto('/').then(() => page.waitForLoadState('networkidle')))
    );

    const loadTime = Date.now() - startTime;

    // All 3 pages should load in under 10 seconds
    expect(loadTime).toBeLessThan(10000);

    await Promise.all(pages.map(page => page.close()));
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    const initialMemory = await getMemoryUsage(page);

    // Navigate to 10 different pages
    const routes = ['/', '/pricing', '/about', '/dashboard', '/settings'];
    
    for (let i = 0; i < 10; i++) {
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
      }
    }

    const finalMemory = await getMemoryUsage(page);
    const memoryGrowth = finalMemory - initialMemory;

    // Memory growth should be under 50MB after 50 navigations
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });

  test('should cache static assets efficiently', async ({ page }) => {
    const responses: { url: string; fromCache: boolean }[] = [];

    page.on('response', response => {
      responses.push({
        url: response.url(),
        fromCache: response.fromCache(),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Second visit should use cache
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cachedResponses = responses.filter(r => r.fromCache);
    
    // At least some responses should be cached
    expect(cachedResponses.length).toBeGreaterThan(0);
  });

  test('should handle large data tables efficiently', async ({ page }) => {
    await page.goto('/dashboard/data');
    await page.waitForLoadState('networkidle');

    const startTime = performance.now();

    // Scroll through the table
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(100);

    const endTime = performance.now();
    const scrollTime = endTime - startTime;

    // Scroll should be responsive (under 500ms)
    expect(scrollTime).toBeLessThan(500);
  });
});

/**
 * Helper Functions
 */
async function gotoAndWaitForMetrics(page: any, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  return getWebVitals(page);
}

async function getWebVitals(page: any) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      let lcp = 0;
      let cls = 0;

      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            cls = clsValue;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Wait for metrics to settle
      setTimeout(() => {
        resolve({ lcp, cls });
      }, 2000);
    });
  });
}

async function getMemoryUsage(page: any): Promise<number> {
  return await page.evaluate(() => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  });
}

/**
 * Performance Budgets for E2E Tests
 */
export const E2E_PERFORMANCE_BUDGETS = {
  loadTime: {
    homepage: 3000,
    dashboard: 4000,
    other: 5000,
  },
  webVitals: {
    lcp: {
      good: 2500,
      needsImprovement: 4000,
    },
    fid: {
      good: 100,
      needsImprovement: 300,
    },
    cls: {
      good: 0.1,
      needsImprovement: 0.25,
    },
  },
  memory: {
    allowedGrowth: 50 * 1024 * 1024, // 50MB
    peak: 150 * 1024 * 1024, // 150MB
  },
  concurrent: {
    users: 10,
    maxLoadTime: 10000,
  },
};
