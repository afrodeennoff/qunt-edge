/**
 * Dynamic Import Utilities for Heavy Libraries
 * 
 * This module provides lazy-loading utilities for heavy dependencies to reduce
 * the initial bundle size and improve Time to Interactive (TTI).
 */

import { lazy, ComponentType } from 'react';

export interface DynamicImportOptions {
  ssr?: boolean;
  loading?: ComponentType;
}

export interface LazyComponents {
  Charts?: ComponentType<any>;
  Editor?: ComponentType<any>;
  PDFExport?: ComponentType<any>;
  ExcelImport?: ComponentType<any>;
  Animation?: ComponentType<any>;
  ImageProcessing?: ComponentType<any>;
}

const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Create a dynamic import with loading state
 */
export function createDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
): T {
  const { ssr = true, loading: LoadingComponent } = options;
  const DefaultLoading = LoadingComponent || DefaultLoading;
  
  return lazy(() => importFn().then(module => ({ default: module.default }))) as T;
}

/**
 * Lazy-loaded chart libraries
 */
export const loadCharts = () => import('recharts');
export const loadD3 = () => import('d3');

/**
 * Lazy-loaded editor libraries
 */
export const loadTipTap = () => import('@tiptap/react');
export const loadTipTapStarterKit = () => import('@tiptap/starter-kit');

/**
 * Lazy-loaded PDF libraries
 */
export const loadPdfLib = () => import('pdf-lib');
export const loadPdf2Json = () => import('pdf2json');

/**
 * Lazy-loaded Excel libraries
 */
export const loadExcelJs = () => import('exceljs');

/**
 * Lazy-loaded animation libraries
 */
export const loadFramerMotion = () => import('framer-motion');

/**
 * Lazy-loaded image processing libraries
 */
export const loadSharp = () => import('sharp');
export const loadCanvas = () => import('canvas');

/**
 * Preload chunks for anticipated navigation
 */
export class ChunkPreloader {
  private preloadedChunks = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  /**
   * Preload a chunk for a specific route or component
   */
  async preload(importFn: () => Promise<any>, key: string): Promise<void> {
    if (this.preloadedChunks.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = importFn()
      .then(() => {
        this.preloadedChunks.add(key);
      })
      .catch((error) => {
        console.warn(`Failed to preload chunk ${key}:`, error);
        this.preloadedChunks.delete(key);
      });

    this.preloadPromises.set(key, promise);
    return promise;
  }

  /**
   * Check if a chunk is already preloaded
   */
  isPreloaded(key: string): boolean {
    return this.preloadedChunks.has(key);
  }

  /**
   * Clear all preloaded chunks
   */
  clear(): void {
    this.preloadedChunks.clear();
    this.preloadPromises.clear();
  }
}

export const chunkPreloader = new ChunkPreloader();

/**
 * Anticipatory preloading for user interactions
 */
export function usePreloadOnHover() {
  if (typeof window === 'undefined') return;

  const preloadLinks = document.querySelectorAll('[data-preload]');

  preloadLinks.forEach((link) => {
    const importPath = link.getAttribute('data-preload');
    if (!importPath) return;

    link.addEventListener('mouseenter', () => {
      if (!chunkPreloader.isPreloaded(importPath)) {
        import(importPath).catch(() => {
          console.warn(`Failed to preload ${importPath}`);
        });
      }
    }, { once: true });
  });
}

/**
 * Dynamic imports for specific dashboard components
 */
export const DashboardLazyComponents = {
  EquityChart: () => import('@/components/charts/equity-chart'),
  PnlTimeBarChart: () => import('@/components/charts/pnl-time-bar-chart'),
  WeekdayPnl: () => import('@/components/charts/weekday-pnl'),
  DailyTickTarget: () => import('@/components/charts/daily-tick-target'),
  PnlPerContractDaily: () => import('@/components/charts/pnl-per-contract-daily'),
  TimeRangePerformance: () => import('@/components/charts/time-range-performance'),
  
  PDFProcessor: () => import('@/components/import/ibkr-pdf/pdf-processing'),
  ExcelProcessor: () => import('@/components/import/excel/excel-processor'),
  
  MindsetWidget: () => import('@/components/mindset/mindset-widget'),
  HourlyFinancialTimeline: () => import('@/components/mindset/hourly-financial-timeline'),
  
  SmartInsightsWidget: () => import('@/components/widgets/smart-insights-widget'),
  PropFirmCatalogueWidget: () => import('@/components/widgets/propfirm-catalogue-widget'),
  
  ChatComponent: () => import('@/components/chat/chat'),
  JournalEditor: () => import('@/components/tiptap-editor'),
};

/**
 * Preload dashboard chunks in priority order
 */
export async function preloadCriticalDashboardChunks() {
  const criticalChunks = [
    () => import('@/components/charts/equity-chart'),
    () => import('@/components/statistics/stats-card'),
  ];

  try {
    await Promise.allSettled(
      criticalChunks.map((chunk, index) => 
        chunkPreloader.preload(chunk, `critical-${index}`)
      )
    );
  } catch (error) {
    console.warn('Some critical chunks failed to preload:', error);
  }
}

/**
 * Monitor bundle size and warn if exceeds threshold
 */
export class BundleSizeMonitor {
  private initialBundleSize: number = 0;
  private threshold: number;

  constructor(thresholdKB: number = 500) {
    this.threshold = thresholdKB * 1024;
    
    if (typeof window !== 'undefined' && performance.getEntriesByType) {
      this.measureInitialBundle();
    }
  }

  private measureInitialBundle() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const mainJs = resources.find(r => r.name.includes('main') && r.name.endsWith('.js'));
    
    if (mainJs) {
      this.initialBundleSize = mainJs.transferSize || mainJs.encodedBodySize || 0;
      
      if (this.initialBundleSize > this.threshold) {
        console.warn(
          `⚠️ Initial bundle size (${(this.initialBundleSize / 1024).toFixed(2)} KB) exceeds threshold (${this.threshold / 1024} KB)`
        );
      }
    }
  }

  getCurrentSize(): number {
    return this.initialBundleSize;
  }

  getThreshold(): number {
    return this.threshold;
  }
}

export const bundleSizeMonitor = new BundleSizeMonitor(500);

/**
 * Retry logic for failed dynamic imports
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Dynamic import attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Web Vitals collection with bundle size context
 */
export function collectWebVitalsWithBundle() {
  if (typeof window === 'undefined') return;

  const bundleSize = bundleSizeMonitor.getCurrentSize();
  
  vitals: {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Web Vital:', {
          name: entry.name,
          value: entry.value,
          bundleSize: `${(bundleSize / 1024).toFixed(2)} KB`,
        });
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    } catch (error) {
      console.warn('PerformanceObserver not available:', error);
    }
  }
}
