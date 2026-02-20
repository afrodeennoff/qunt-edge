/**
 * Error Boundaries and Optimization Failure Handlers
 * 
 * Provides comprehensive error handling for image loading, font loading,
 * and other optimization failures with proper fallback strategies.
 */

'use client'

import React, { Component, ReactNode } from 'react'

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, errorInfo: React.ErrorInfo) => ReactNode)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean // Prevent error from propagating
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({ errorInfo })

    // Log to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      })
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props

      if (typeof fallback === 'function') {
        return fallback(
          this.state.error!,
          this.state.errorInfo!
        )
      }

      return fallback || (
        <div className="flex items-center justify-center min-h-[400px] bg-destructive/10">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Image loading error boundary
 */
export interface ImageErrorBoundaryProps {
  src: string
  alt: string
  children: ReactNode
  fallback?: ReactNode
}

export function ImageErrorBoundary({
  src,
  alt,
  children,
  fallback,
}: ImageErrorBoundaryProps) {
  const [hasError, setHasError] = React.useState(false)

  // Reset error when src changes
  React.useEffect(() => {
    setHasError(false)
  }, [src])

  // Error handler
  const handleError = () => {
    console.error(`Failed to load image: ${src}`)
    setHasError(true)
  }

  if (hasError) {
    return (
      fallback || (
        <div className="flex items-center justify-center bg-muted text-muted-foreground">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )
    )
  }

  return (
    <React.Fragment>
      {React.cloneElement(children as React.ReactElement, {
        onError: handleError,
      })}
    </React.Fragment>
  )
}

/**
 * Font loading error boundary
 */
export interface FontErrorBoundaryProps {
  fontName: string
  children: ReactNode
  fallbackFont?: string
}

export function FontErrorBoundary({
  fontName,
  children,
  fallbackFont = 'system-ui, sans-serif',
}: FontErrorBoundaryProps) {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return

    document.fonts.load(`16px "${fontName}"`)
      .then(() => {
        setHasError(false)
      })
      .catch(() => {
        console.error(`Failed to load font: ${fontName}`)
        setHasError(true)
      })
  }, [fontName])

  if (hasError) {
    return (
      <div style={{ fontFamily: fallbackFont }}>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Async component boundary for lazy loaded components
 */
export interface AsyncBoundaryProps {
  children: ReactNode
  loading?: ReactNode
  error?: ReactNode | ((error: Error) => ReactNode)
  timeout?: number
  onTimeout?: () => void
}

interface AsyncBoundaryState {
  isLoading: boolean
  hasError: boolean
  error?: Error
}

export class AsyncBoundary extends Component<
  AsyncBoundaryProps,
  AsyncBoundaryState
> {
  private timeoutId: NodeJS.Timeout | null = null

  constructor(props: AsyncBoundaryProps) {
    super(props)
    this.state = {
      isLoading: true,
      hasError: false,
    }
  }

  componentDidMount() {
    const { timeout, onTimeout } = this.props

    if (timeout) {
      this.timeoutId = setTimeout(() => {
        console.warn('Async component loading timeout')
        if (onTimeout) onTimeout()
      }, timeout)
    }

    this.setState({ isLoading: false })
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  static getDerivedStateFromError(error: Error): AsyncBoundaryState {
    return {
      isLoading: false,
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error) {
    console.error('Async Boundary Error:', error)
  }

  render() {
    const { children, loading, error } = this.props
    const { isLoading, hasError, error: caughtError } = this.state

    if (isLoading) {
      return (
        loading || (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )
      )
    }

    if (hasError) {
      const errorNode = typeof error === 'function' ? error(caughtError!) : error
      
      return (
        errorNode || (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-destructive">
              Failed to load component. Please refresh the page.
            </p>
          </div>
        )
      )
    }

    return children
  }
}

/**
 * Optimization failure handler
 */
export class OptimizationFailureHandler {
  private failures = new Map<string, number>()
  private lastFailureTime = new Map<string, number>()

  /**
   * Record a failure
   */
  recordFailure(optimization: string, maxFailures = 3): boolean {
    const count = (this.failures.get(optimization) || 0) + 1
    this.failures.set(optimization, count)
    this.lastFailureTime.set(optimization, Date.now())

    if (count >= maxFailures) {
      console.error(`Optimization ${optimization} failed ${count} times`)
      return true // Should disable optimization
    }

    return false
  }

  /**
   * Reset failure count
   */
  resetFailure(optimization: string): void {
    this.failures.set(optimization, 0)
    this.lastFailureTime.delete(optimization)
  }

  /**
   * Check if optimization should be disabled
   */
  shouldDisable(optimization: string, cooldownPeriod = 300000): boolean {
    const count = this.failures.get(optimization) || 0
    const lastFailure = this.lastFailureTime.get(optimization) || 0

    // Disable if too many failures or still in cooldown
    return count >= 3 || Date.now() - lastFailure < cooldownPeriod
  }

  /**
   * Get failure statistics
   */
  getStats(optimization: string) {
    return {
      failures: this.failures.get(optimization) || 0,
      lastFailure: this.lastFailureTime.get(optimization) || 0,
    }
  }

  /**
   * Clear all failure records
   */
  clear(): void {
    this.failures.clear()
    this.lastFailureTime.clear()
  }
}

export const optimizationFailureHandler = new OptimizationFailureHandler()

/**
 * Hydration mismatch prevention
 */
export function useHydrationFix<T>(
  serverValue: T,
  clientValue: T
): T {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? clientValue : serverValue
}

/**
 * Safe image component with error boundary
 */
export interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function SafeImage({ src, alt, width, height, className }: SafeImageProps) {
  return (
    <ImageErrorBoundary src={src} alt={alt}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    </ImageErrorBoundary>
  )
}

/**
 * Safe dynamic import with error handling
 */
export async function safeDynamicImport<T>(
  importFn: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  try {
    return await importFn()
  } catch (error) {
    console.error('Dynamic import failed, using fallback:', error)
    return fallback()
  }
}

/**
 * Performance degradation handler
 */
export class PerformanceDegradationHandler {
  private metrics = {
    fps: 60,
    longTasks: 0,
    memoryUsage: 0,
  }

  private isDegraded = false

  /**
   * Monitor performance metrics
   */
  monitor() {
    if (typeof window === 'undefined') return

    // Monitor FPS
    let frameCount = 0
    let lastTime = performance.now()

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime

        if (this.metrics.fps < 30 && !this.isDegraded) {
          this.degrade()
        }
      }

      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.metrics.longTasks++
          }
        }

        if (this.metrics.longTasks > 10 && !this.isDegraded) {
          this.degrade()
        }
      })

      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Long task API not supported
      }
    }

    // Monitor memory
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit

        if (this.metrics.memoryUsage > 0.9 && !this.isDegraded) {
          this.degrade()
        }
      }
    }, 10000)
  }

  /**
   * Degrade performance (disable expensive features)
   */
  degrade() {
    this.isDegraded = true
    console.warn('Performance degraded, disabling expensive features')

    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('performance-degraded'))
  }

  /**
   * Recover from degradation
   */
  recover() {
    this.isDegraded = false
    console.log('Performance recovered')

    window.dispatchEvent(new CustomEvent('performance-recovered'))
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    return this.isDegraded
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return { ...this.metrics }
  }
}

export const performanceDegradationHandler = new PerformanceDegradationHandler()

/**
 * Hook to listen for performance degradation
 */
export function usePerformanceDegradation() {
  const [isDegraded, setIsDegraded] = React.useState(false)

  React.useEffect(() => {
    const handleDegraded = () => setIsDegraded(true)
    const handleRecovered = () => setIsDegraded(false)

    window.addEventListener('performance-degraded', handleDegraded)
    window.addEventListener('performance-recovered', handleRecovered)

    return () => {
      window.removeEventListener('performance-degraded', handleDegraded)
      window.removeEventListener('performance-recovered', handleRecovered)
    }
  }, [])

  return isDegraded
}
