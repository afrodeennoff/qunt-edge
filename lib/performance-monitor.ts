export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'kb' | 'count' | 'percentage'
  timestamp: Date
  threshold?: number
}

export interface PerformanceReport {
  period: { start: Date; end: Date }
  metrics: PerformanceMetric[]
  summary: {
    averageResponseTime: number
    slowestQuery: string
    totalQueries: number
    cacheHitRate: number
  }
  recommendations: string[]
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private cacheHits = 0
  private cacheMisses = 0

  recordMetric(metric: PerformanceMetric): void {
    const key = metric.name
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    this.metrics.get(key)!.push(metric)
    
    if (metric.threshold && metric.value > metric.threshold) {
      console.warn(`[Performance Alert] ${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${metric.threshold}${metric.unit}`)
    }
  }

  recordQueryDuration(queryName: string, durationMs: number): void {
    this.recordMetric({
      name: queryName,
      value: durationMs,
      unit: 'ms',
      timestamp: new Date(),
      threshold: 1000, // Alert if query takes more than 1 second
    })
  }

  recordBundleSize(bundleName: string, sizeKb: number): void {
    this.recordMetric({
      name: bundleName,
      value: sizeKb,
      unit: 'kb',
      timestamp: new Date(),
      threshold: 500, // Alert if bundle is larger than 500KB
    })
  }

  recordCacheHit(): void {
    this.cacheHits++
  }

  recordCacheMiss(): void {
    this.cacheMisses++
  }

  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses
    return total > 0 ? (this.cacheHits / total) * 100 : 0
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || []
  }

  getAverageValue(name: string): number {
    const metrics = this.getMetricsByName(name)
    if (metrics.length === 0) return 0
    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  generateReport(period: { start: Date; end: Date }): PerformanceReport {
    const allMetrics = Array.from(this.metrics.values()).flat()
    const periodMetrics = allMetrics.filter(
      m => m.timestamp >= period.start && m.timestamp <= period.end
    )

    const queryMetrics = periodMetrics.filter(m => m.name.includes('Query') || m.name.includes('get'))
    const averageResponseTime = queryMetrics.length > 0
      ? queryMetrics.reduce((sum, m) => sum + m.value, 0) / queryMetrics.length
      : 0

    const slowestQuery = queryMetrics.length > 0
      ? queryMetrics.reduce((slowest, m) => m.value > slowest.value ? m : slowest)
      : null

    return {
      period,
      metrics: periodMetrics,
      summary: {
        averageResponseTime,
        slowestQuery: slowestQuery?.name || 'N/A',
        totalQueries: queryMetrics.length,
        cacheHitRate: this.getCacheHitRate(),
      },
      recommendations: this.generateRecommendations(periodMetrics),
    }
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = []

    const slowQueries = metrics.filter(m => m.value > (m.threshold || 1000))
    if (slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} slow queries. Consider adding database indexes or optimizing query structure.`)
    }

    const largeBundles = metrics.filter(m => m.unit === 'kb' && m.value > (m.threshold || 500))
    if (largeBundles.length > 0) {
      recommendations.push(`Found ${largeBundles.length} large bundles. Implement code splitting and lazy loading.`)
    }

    const cacheHitRate = this.getCacheHitRate()
    if (cacheHitRate < 50) {
      recommendations.push(`Cache hit rate is low (${cacheHitRate.toFixed(1)}%). Review caching strategy and increase TTL where appropriate.`)
    }

    return recommendations
  }

  clear(): void {
    this.metrics.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = Date.now()
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then(res => {
        const duration = Date.now() - start
        performanceMonitor.recordQueryDuration(name, duration)
        return res
      })
    }
    
    const duration = Date.now() - start
    performanceMonitor.recordQueryDuration(name, duration)
    return result
  } catch (error) {
    const duration = Date.now() - start
    performanceMonitor.recordQueryDuration(name, duration)
    throw error
  }
}

export async function getPerformanceReport(): Promise<PerformanceReport> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  return performanceMonitor.generateReport({
    start: oneHourAgo,
    end: now,
  })
}
