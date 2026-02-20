/**
 * ISR (Incremental Static Regeneration) Implementation with Error Handling
 * 
 * Provides utilities for implementing ISR with fallback strategies,
 * error recovery, and data pre-fetching optimization.
 */

import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'

/**
 * ISR configuration
 */
export interface ISRConfig {
  revalidate: number // in seconds
  fallback?: 'blocking' | false
  generateStaticParams?: boolean
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  maxRetries?: number
  retryDelay?: number
  logErrors?: boolean
  onError?: (error: Error, context: string) => void
  onRecover?: () => void
}

/**
 * Data fetching result with error handling
 */
export interface DataFetchResult<T> {
  data?: T
  error?: Error
  revalidated?: boolean
  fallback?: boolean
}

/**
 * ISR implementation with fallback blocking
 */
export class ISRHandler {
  private static instance: ISRHandler
  private revalidationQueue = new Map<string, Promise<any>>()
  private errorCounts = new Map<string, number>()

  static getInstance(): ISRHandler {
    if (!ISRHandler.instance) {
      ISRHandler.instance = new ISRHandler()
    }
    return ISRHandler.instance
  }

  /**
   * Implement getStaticProps with ISR
   */
  static getStaticProps<T>(
    dataFetcher: () => Promise<T>,
    config: ISRConfig = { revalidate: 3600 }, // 1 hour default
    errorConfig: ErrorHandlingConfig = {}
  ): GetStaticProps<DataFetchResult<T>> {
    return async (context) => {
      const { params, preview } = context
      const cacheKey = params ? JSON.stringify(params) : 'default'

      try {
        // Check if there's an ongoing revalidation
        const ongoingRevalidation = this.getInstance().revalidationQueue.get(cacheKey)
        if (ongoingRevalidation) {
          return {
            props: {
              data: undefined,
              fallback: true,
              revalidated: false,
            } as DataFetchResult<T>,
            revalidate: config.revalidate,
          }
        }

        // Fetch data
        const revalidationPromise = dataFetcher()
        this.getInstance().revalidationQueue.set(cacheKey, revalidationPromise)

        const data = await revalidationPromise
        this.getInstance().revalidationQueue.delete(cacheKey)
        this.getInstance().errorCounts.delete(cacheKey)

        return {
          props: {
            data,
            revalidated: true,
          } as DataFetchResult<T>,
          revalidate: config.revalidate,
        }
      } catch (error) {
        const err = error as Error
        this.getInstance().revalidationQueue.delete(cacheKey)

        // Increment error count
        const errorCount = (this.getInstance().errorCounts.get(cacheKey) || 0) + 1
        this.getInstance().errorCounts.set(cacheKey, errorCount)

        // Log error
        if (errorConfig.logErrors !== false) {
          console.error(`ISR Error for ${cacheKey}:`, err)
        }

        // Call error callback
        if (errorConfig.onError) {
          errorConfig.onError(err, cacheKey)
        }

        // Retry logic
        const maxRetries = errorConfig.maxRetries || 3
        if (errorCount < maxRetries) {
          const retryDelay = errorConfig.retryDelay || 1000 * errorCount
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          
          // Retry will happen on next request
          return {
            props: {
              data: undefined,
              error: err,
              revalidated: false,
            } as DataFetchResult<T>,
            revalidate: Math.min(config.revalidate, 60), // Reduce revalidate time on error
          }
        }

        // Max retries exceeded, return fallback
        return {
          props: {
            data: undefined,
            error: err,
            revalidated: false,
          } as DataFetchResult<T>,
          revalidate: config.revalidate,
          notFound: true,
        }
      }
    }
  }

  /**
   * Implement getStaticPaths with ISR
   */
  static getStaticPaths(
    pathsGenerator: () => Promise<string[]>,
    config: ISRConfig = { revalidate: 3600 }
  ): GetStaticPaths {
    return async () => {
      try {
        const paths = await pathsGenerator()

        return {
          paths: paths.map(path => ({ params: { slug: path.split('/') } })),
          fallback: config.fallback || 'blocking',
        }
      } catch (error) {
        console.error('getStaticPaths Error:', error)
        
        // Return empty paths on error to prevent build failure
        return {
          paths: [],
          fallback: 'blocking',
        }
      }
    }
  }

  /**
   * On-demand revalidation
   */
  static async revalidate(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      return response.ok
    } catch (error) {
      console.error('Revalidation failed:', error)
      return false
    }
  }

  /**
   * Batch revalidation for multiple paths
   */
  static async batchRevalidate(paths: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = {
      success: [] as string[],
      failed: [] as string[],
    }

    await Promise.allSettled(
      paths.map(async path => {
        const success = await this.revalidate(path)
        if (success) {
          results.success.push(path)
        } else {
          results.failed.push(path)
        }
      })
    )

    return results
  }

  /**
   * Clear error counts (for testing or manual reset)
   */
  clearErrorCounts(): void {
    this.errorCounts.clear()
  }
}

/**
 * Data pre-fetching optimization
 */
export class DataPreFetcher {
  private prefetchCache = new Map<string, { data: any, timestamp: number }>()
  private prefetchQueue = new Map<string, Promise<any>>()

  /**
   * Prefetch data for a page
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 300000 // 5 minutes default
  ): Promise<T> {
    // Check cache
    const cached = this.prefetchCache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T
    }

    // Check if there's an ongoing prefetch
    const ongoing = this.prefetchQueue.get(key)
    if (ongoing) {
      return ongoing
    }

    // Fetch data
    const promise = fetcher().then(data => {
      this.prefetchCache.set(key, { data, timestamp: Date.now() })
      this.prefetchQueue.delete(key)
      return data
    }).catch(error => {
      this.prefetchQueue.delete(key)
      throw error
    })

    this.prefetchQueue.set(key, promise)
    return promise
  }

  /**
   * Prefetch multiple pages
   */
  async prefetchMany<T>(
    entries: Array<{ key: string, fetcher: () => Promise<T> }>,
    ttl = 300000
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    await Promise.all(
      entries.map(async ({ key, fetcher }) => {
        try {
          const data = await this.prefetch(key, fetcher, ttl)
          results.set(key, data)
        } catch (error) {
          console.error(`Failed to prefetch ${key}:`, error)
        }
      })
    )

    return results
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.prefetchCache.clear()
    this.prefetchQueue.clear()
  }

  /**
   * Remove specific entry from cache
   */
  invalidate(key: string): void {
    this.prefetchCache.delete(key)
  }
}

export const dataPreFetcher = new DataPreFetcher()

/**
 * ISR configuration presets for common use cases
 */
export const ISRPresets = {
  /**
   * High-frequency data (revalidates every 10 seconds)
   */
  highFrequency: {
    revalidate: 10,
    fallback: 'blocking' as const,
  },

  /**
   * Real-time data (revalidates every second)
   */
  realTime: {
    revalidate: 1,
    fallback: 'blocking' as const,
  },

  /**
   * Medium frequency (revalidates every minute)
   */
  medium: {
    revalidate: 60,
    fallback: 'blocking' as const,
  },

  /**
   * Low frequency (revalidates every hour)
   */
  low: {
    revalidate: 3600,
    fallback: false,
  },

  /**
   * Static (revalidates every day)
   */
  static: {
    revalidate: 86400,
    fallback: false,
  },
}

/**
 * Error recovery strategies
 */
export class ErrorRecoveryStrategy {
  /**
   * Exponential backoff retry
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (attempt === maxRetries - 1) throw error
        
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('Max retries exceeded')
  }

  /**
   * Circuit breaker pattern
   */
  static circuitBreaker<T>(
    fn: () => Promise<T>,
    threshold = 5,
    timeout = 60000
  ): () => Promise<T> {
    let failureCount = 0
    let lastFailureTime = 0
    let state: 'closed' | 'open' | 'half-open' = 'closed'

    return async () => {
      const now = Date.now()

      // Check if circuit should reset
      if (state === 'open' && now - lastFailureTime > timeout) {
        state = 'half-open'
        failureCount = 0
      }

      // Reject if circuit is open
      if (state === 'open') {
        throw new Error('Circuit breaker is OPEN')
      }

      try {
        const result = await fn()
        
        // Reset on success
        if (state === 'half-open') {
          state = 'closed'
        }
        failureCount = 0
        
        return result
      } catch (error) {
        failureCount++
        lastFailureTime = now

        // Open circuit if threshold reached
        if (failureCount >= threshold) {
          state = 'open'
          console.error('Circuit breaker opened due to repeated failures')
        }

        throw error
      }
    }
  }
}

/**
 * API route for on-demand revalidation
 * Create this at /api/revalidate/route.ts
 */
export const revalidationApiRoute = `
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    revalidatePath(path)

    return NextResponse.json({ revalidated: true, path })
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}
`

/**
 * Hook for ISR data fetching in client components
 */
export function useISRData<T>(
  key: string,
  fetcher: () => Promise<T>,
  initialData?: T,
  revalidateOnMount = true
) {
  const [data, setData] = React.useState<T | undefined>(initialData)
  const [error, setError] = React.useState<Error | undefined>()
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    if (!revalidateOnMount && data) return

    setIsLoading(true)
    setError(undefined)

    try {
      const fetchedData = await dataPreFetcher.prefetch(key, fetcher)
      setData(fetchedData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, revalidateOnMount, data])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, isLoading, revalidate: fetchData }
}

/**
 * ISR health monitoring
 */
export class ISRHealthMonitor {
  private metrics = {
    successfulRevalidations: 0,
    failedRevalidations: 0,
    averageRevalidationTime: 0,
    cacheHitRate: 0,
  }

  recordRevalidation(duration: number, success: boolean): void {
    if (success) {
      this.metrics.successfulRevalidations++
    } else {
      this.metrics.failedRevalidations++
    }

    // Update average time
    const total = this.metrics.successfulRevalidations + this.metrics.failedRevalidations
    this.metrics.averageRevalidationTime =
      (this.metrics.averageRevalidationTime * (total - 1) + duration) / total
  }

  getMetrics() {
    return { ...this.metrics }
  }

  getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const total = this.metrics.successfulRevalidations + this.metrics.failedRevalidations
    if (total === 0) return 'healthy'

    const failureRate = this.metrics.failedRevalidations / total

    if (failureRate > 0.5) return 'unhealthy'
    if (failureRate > 0.1) return 'degraded'
    return 'healthy'
  }
}

export const isrHealthMonitor = new ISRHealthMonitor()
