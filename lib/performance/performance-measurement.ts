'use client'

import { useCallback } from 'react'

interface PerformanceSnapshot {
  timestamp: number
  fps: number
  memoryUsage: number
  renderTime: number
  interactionTime: number
  frameTime: number
}

interface PerformanceMetrics {
  before: PerformanceSnapshot
  after: PerformanceSnapshot
  improvement: {
    fps: number
    memoryUsage: number
    renderTime: number
    frameTime: number
  }
  percentageImprovement: {
    fps: number
    memoryUsage: number
    renderTime: number
    frameTime: number
  }
}

class PerformanceMeasurement {
  private snapshots: PerformanceSnapshot[] = []
  private measurements: Map<string, number[]> = new Map()
  private rafId: number | null = null
  private frameCount = 0
  private lastFrameTime = 0

  startMeasurement(label: string) {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      const existing = this.measurements.get(label) || []
      this.measurements.set(label, [...existing, duration])
      
      return duration
    }
  }

  measureFPS(duration = 1000): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0
      const startTime = performance.now()

      const countFrame = () => {
        frames++
        const elapsed = performance.now() - startTime

        if (elapsed >= duration) {
          const fps = Math.round((frames / elapsed) * 1000)
          resolve(fps)
          return
        }

        requestAnimationFrame(countFrame)
      }

      requestAnimationFrame(countFrame)
    })
  }

  async takeSnapshot(): Promise<PerformanceSnapshot> {
    const fps = await this.measureFPS(500)
    const renderTime = this.getAverageMetric('renderTime') || 0
    const interactionTime = this.getAverageMetric('interactionTime') || 0
    const frameTime = 1000 / fps
    const memoryUsage = this.getMemoryUsage()

    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      fps,
      memoryUsage,
      renderTime,
      interactionTime,
      frameTime
    }

    this.snapshots.push(snapshot)
    return snapshot
  }

  getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1048576
    }
    return 0
  }

  getAverageMetric(label: string): number {
    const measurements = this.measurements.get(label)
    if (!measurements || measurements.length === 0) return 0

    const sum = measurements.reduce((acc, val) => acc + val, 0)
    return sum / measurements.length
  }

  getPercentileMetric(label: string, percentile: number): number {
    const measurements = this.measurements.get(label)
    if (!measurements || measurements.length === 0) return 0

    const sorted = [...measurements].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index]
  }

  compareSnapshots(beforeIndex: number, afterIndex: number): PerformanceMetrics {
    const before = this.snapshots[beforeIndex]
    const after = this.snapshots[afterIndex]

    const improvement = {
      fps: after.fps - before.fps,
      memoryUsage: before.memoryUsage - after.memoryUsage,
      renderTime: before.renderTime - after.renderTime,
      frameTime: before.frameTime - after.frameTime
    }

    const percentageImprovement = {
      fps: ((after.fps - before.fps) / before.fps) * 100,
      memoryUsage: ((before.memoryUsage - after.memoryUsage) / before.memoryUsage) * 100,
      renderTime: ((before.renderTime - after.renderTime) / before.renderTime) * 100,
      frameTime: ((before.frameTime - after.frameTime) / before.frameTime) * 100
    }

    return {
      before,
      after,
      improvement,
      percentageImprovement
    }
  }

  generateReport(): string {
    if (this.snapshots.length < 2) {
      return 'Insufficient data for performance comparison'
    }

    const comparison = this.compareSnapshots(0, this.snapshots.length - 1)

    return `
Performance Comparison Report
=============================
Before:
  FPS: ${comparison.before.fps}
  Memory: ${comparison.before.memoryUsage.toFixed(2)} MB
  Render Time: ${comparison.before.renderTime.toFixed(2)} ms
  Frame Time: ${comparison.before.frameTime.toFixed(2)} ms

After:
  FPS: ${comparison.after.fps}
  Memory: ${comparison.after.memoryUsage.toFixed(2)} MB
  Render Time: ${comparison.after.renderTime.toFixed(2)} ms
  Frame Time: ${comparison.after.frameTime.toFixed(2)} ms

Improvements:
  FPS: ${comparison.improvement.fps > 0 ? '+' : ''}${comparison.improvement.fps} (${comparison.percentageImprovement.fps.toFixed(1)}%)
  Memory: ${comparison.improvement.memoryUsage > 0 ? '-' : '+'}${Math.abs(comparison.improvement.memoryUsage).toFixed(2)} MB (${comparison.percentageImprovement.memoryUsage.toFixed(1)}%)
  Render Time: ${comparison.improvement.renderTime > 0 ? '-' : '+'}${Math.abs(comparison.improvement.renderTime).toFixed(2)} ms (${comparison.percentageImprovement.renderTime.toFixed(1)}%)
  Frame Time: ${comparison.improvement.frameTime > 0 ? '-' : '+'}${Math.abs(comparison.improvement.frameTime).toFixed(2)} ms (${comparison.percentageImprovement.frameTime.toFixed(1)}%)
    `.trim()
  }

  clear() {
    this.snapshots = []
    this.measurements.clear()
  }
}

export const performanceMeasurement = new PerformanceMeasurement()

export function usePerformanceMeasurement() {
  const measure = useCallback((label: string) => {
    return performanceMeasurement.startMeasurement(label)
  }, [])

  const snapshot = useCallback(() => {
    return performanceMeasurement.takeSnapshot()
  }, [])

  const getReport = useCallback(() => {
    return performanceMeasurement.generateReport()
  }, [])

  return { measure, snapshot, getReport }
}
