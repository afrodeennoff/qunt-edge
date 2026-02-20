'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderCount: number
  renderTime: number[]
  averageRenderTime: number
  lastRenderTime: number
  memoryUsage?: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []
  private isMonitoring = false

  start() {
    if (this.isMonitoring || typeof window === 'undefined') return
    this.isMonitoring = true

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.startsWith('component-')) {
            const componentName = entry.name.replace('component-', '')
            this.recordRender(componentName, entry.duration)
          }
        }
      })
      observer.observe({ entryTypes: ['measure'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('PerformanceObserver not available:', error)
    }
  }

  stop() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.isMonitoring = false
  }

  recordRender(componentName: string, duration: number) {
    const existing = this.metrics.get(componentName)
    const renderTimes = existing ? [...existing.renderTime, duration] : [duration]
    
    const maxSamples = 50
    const sampledTimes = renderTimes.slice(-maxSamples)
    
    this.metrics.set(componentName, {
      componentName,
      renderCount: (existing?.renderCount ?? 0) + 1,
      renderTime: sampledTimes,
      averageRenderTime: sampledTimes.reduce((a, b) => a + b, 0) / sampledTimes.length,
      lastRenderTime: duration,
      memoryUsage: this.getMemoryUsage(),
    })
  }

  getMetrics(componentName?: string): PerformanceMetrics | PerformanceMetrics[] | undefined {
    if (componentName) {
      return this.metrics.get(componentName)
    }
    return Array.from(this.metrics.values())
  }

  getSlowComponents(threshold = 16): PerformanceMetrics[] {
    return Array.from(this.metrics.values())
      .filter(m => m.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
  }

  getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1048576
    }
    return undefined
  }

  clear() {
    this.metrics.clear()
  }

  printReport() {
    console.group('🔍 Performance Monitor Report')
    const metrics = this.getMetrics() as PerformanceMetrics[]
    
    if (metrics.length === 0) {
      console.log('No metrics recorded yet')
      console.groupEnd()
      return
    }

    console.table(
      metrics.map(m => ({
        Component: m.componentName,
        Renders: m.renderCount,
        'Avg Time (ms)': m.averageRenderTime.toFixed(2),
        'Last Time (ms)': m.lastRenderTime.toFixed(2),
        'Memory (MB)': m.memoryUsage?.toFixed(2) ?? 'N/A',
      }))
    )

    const slowComponents = this.getSlowComponents()
    if (slowComponents.length > 0) {
      console.warn('⚠️ Slow Components (>16ms):', slowComponents.map(c => c.componentName))
    }

    console.groupEnd()
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)

  useEffect(() => {
    performanceMonitor.start()
    return () => performanceMonitor.stop()
  }, [])

  useEffect(() => {
    renderStartTime.current = performance.now()
    return () => {
      const renderTime = performance.now() - renderStartTime.current
      performanceMonitor.recordRender(componentName, renderTime)
      
      if (renderTime > 16) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}

export function useMemoryMonitor(componentName: string, interval = 5000) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const memory = performanceMonitor.getMemoryUsage()
      if (memory && memory > 100) {
        console.warn(`⚠️ High memory usage in ${componentName}: ${memory.toFixed(2)}MB`)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [componentName, interval])
}
