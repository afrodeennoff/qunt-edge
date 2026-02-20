/**
 * Dynamic Import Utilities for Code Splitting
 * 
 * This module provides utilities for lazy loading components and modules
 * to reduce initial bundle size and improve time-to-interactive.
 */

import { ComponentType } from 'react'
import dynamic from 'next/dynamic'

export interface DynamicImportOptions {
  ssr?: boolean
  loading?: ComponentType
  preload?: boolean
  suspense?: boolean
}

/**
 * Creates a dynamically imported component with optimized loading
 */
export function createDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
): T {
  const {
    ssr = true,
    loading: LoadingComponent,
    preload = false,
  } = options

  // Create loading component if not provided
  const DefaultLoading = LoadingComponent || (() => (
    <div className="animate-pulse bg-muted h-48 w-full rounded" />
  ))

  // Dynamic component with loading state
  const DynamicComponent = dynamic(importFn, {
    ssr,
    loading: () => <DefaultLoading />,
  })

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    importFn()
  }

  return DynamicComponent as T
}

/**
 * Dynamic import with Suspense boundary
 */
export function createSuspenseImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): T {
  return dynamic(importFn, {
    ssr: false,
    loading: () => fallback || <div className="animate-pulse bg-muted h-48 w-full rounded" />,
  }) as T
}

/**
 * Route-based code splitting utilities
 */
export const RouteImports = {
  // Dashboard routes (lazy load dashboard components)
  dashboard: () => import('@/app/[locale]/dashboard/page'),
  
  // Trading routes
  trading: () => import('@/app/[locale]/trading/page'),
  
  // Settings routes
  settings: () => import('@/app/[locale]/settings/page'),
  
  // Profile routes
  profile: () => import('@/app/[locale]/profile/page'),
}

/**
 * Feature-based dynamic imports
 * Groups related components together for better chunking
 */
export const FeatureImports = {
  // Chart components (heavy, lazy load)
  charts: {
    equityChart: () => import('@/components/charts/equity-chart'),
    performanceChart: () => import('@/components/charts/performance-chart'),
    analysisChart: () => import('@/components/charts/analysis-chart'),
  },
  
  // Widget components
  widgets: {
    statsWidget: () => import('@/components/widgets/stats-widget'),
    tradesWidget: () => import('@/components/widgets/trades-widget'),
    calendarWidget: () => import('@/components/widgets/calendar-widget'),
  },
  
  // Form components
  forms: {
    loginForm: () => import('@/components/forms/login-form'),
    signupForm: () => import('@/components/forms/signup-form'),
    profileForm: () => import('@/components/forms/profile-form'),
  },
  
  // Modal components
  modals: {
    settingsModal: () => import('@/components/modals/settings-modal'),
    shareModal: () => import('@/components/modals/share-modal'),
    exportModal: () => import('@/components/modals/export-modal'),
  },
}

/**
 * Prefetch utility for anticipating user navigation
 */
export function prefetchRoute(routePath: string): void {
  if (typeof window === 'undefined') return
  
  // Use Next.js router for prefetching
  import('next/router').then(({ useRouter }) => {
    const router = useRouter()
    if (router.prefetch) {
      router.prefetch(routePath)
    }
  })
}

/**
 * Intersection Observer-based lazy loading for below-fold components
 */
export function useIntersectionLazyLoad(
  threshold = 0.1,
  rootMargin = '50px'
): [(node: HTMLElement | null) => void, boolean] {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [node, setNode] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [node, threshold, rootMargin])

  return [setNode, isIntersecting]
}

/**
 * Chunk preload strategy based on user behavior
 */
export class ChunkPreloader {
  private preloadedChunks = new Set<string>()
  private preloadTimeout: NodeJS.Timeout | null = null

  /**
   * Preload chunks after a delay (anticipatory loading)
   */
  schedulePreload(chunkImport: () => Promise<any>, delay = 2000): void {
    if (this.preloadTimeout) {
      clearTimeout(this.preloadTimeout)
    }

    this.preloadTimeout = setTimeout(() => {
      const chunkKey = chunkImport.toString()
      if (!this.preloadedChunks.has(chunkKey)) {
        chunkImport().then(() => {
          this.preloadedChunks.add(chunkKey)
        }).catch(err => {
          console.warn('Failed to preload chunk:', err)
        })
      }
    }, delay)
  }

  /**
   * Cancel scheduled preload
   */
  cancelPreload(): void {
    if (this.preloadTimeout) {
      clearTimeout(this.preloadTimeout)
      this.preloadTimeout = null
    }
  }

  /**
   * Preload on user intent (hover, focus, etc.)
   */
  preloadOnIntent(chunkImport: () => Promise<any>): () => void {
    return () => {
      const chunkKey = chunkImport.toString()
      if (!this.preloadedChunks.has(chunkKey)) {
        chunkImport().then(() => {
          this.preloadedChunks.add(chunkKey)
        }).catch(err => {
          console.warn('Failed to preload chunk:', err)
        })
      }
    }
  }

  /**
   * Clear all preloaded chunks (for memory management)
   */
  clear(): void {
    this.preloadedChunks.clear()
    if (this.preloadTimeout) {
      clearTimeout(this.preloadTimeout)
      this.preloadTimeout = null
    }
  }
}

export const chunkPreloader = new ChunkPreloader()

/**
 * Dynamic import with retry logic for flaky networks
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFn()
    } catch (error) {
      lastError = error as Error
      console.warn(`Import attempt ${i + 1} failed, retrying...`, error)
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}

/**
 * Bundle size monitoring utilities
 */
export class BundleSizeMonitor {
  private initialLoad = true
  private metrics: Record<string, number> = {}

  /**
   * Record bundle size for a component
   */
  recordSize(componentName: string, size: number): void {
    this.metrics[componentName] = size
    this.logMetrics()
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): Record<string, number> {
    return { ...this.metrics }
  }

  /**
   * Log metrics to console (development only)
   */
  private logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      console.table(
        Object.entries(this.metrics).map(([name, size]) => ({
          Component: name,
          'Size (KB)': (size / 1024).toFixed(2),
        }))
      )
    }
  }

  /**
   * Check if bundle size exceeds threshold
   */
  exceedsThreshold(componentName: string, thresholdKB: number): boolean {
    const size = this.metrics[componentName]
    return size ? size / 1024 > thresholdKB : false
  }
}

export const bundleSizeMonitor = new BundleSizeMonitor()
