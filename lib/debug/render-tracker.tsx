'use client'

import { useEffect, useRef } from 'react'

interface RenderInfo {
  componentName: string
  renderCount: number
  timestamps: number[]
  reasons: string[]
}

class RenderTracker {
  private renders: Map<string, RenderInfo> = new Map()
  private isEnabled = false

  enable() {
    if (this.isEnabled) return
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  trackRender(componentName: string, reason?: string) {
    if (!this.isEnabled) return

    const existing = this.renders.get(componentName)
    const now = Date.now()
    
    this.renders.set(componentName, {
      componentName,
      renderCount: (existing?.renderCount ?? 0) + 1,
      timestamps: existing ? [...existing.timestamps, now] : [now],
      reasons: reason ? [...(existing?.reasons ?? []), reason] : (existing?.reasons ?? []),
    })
  }

  getRenderCount(componentName: string): number {
    return this.renders.get(componentName)?.renderCount ?? 0
  }

  getTopRenderers(limit = 10): RenderInfo[] {
    return Array.from(this.renders.values())
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, limit)
  }

  printReport() {
    console.group('🔍 Render Tracker Report')
    
    const topRenderers = this.getTopRenderers(20)
    
    if (topRenderers.length === 0) {
      console.info('No renders tracked yet')
      console.groupEnd()
      return
    }

    console.table(
      topRenderers.map(r => ({
        Component: r.componentName,
        Renders: r.renderCount,
      }))
    )

    const frequentRerenders = topRenderers.filter(r => r.renderCount > 50)
    if (frequentRerenders.length > 0) {
      console.warn('⚠️ Components with frequent re-renders:', 
        frequentRerenders.map(r => `${r.componentName} (${r.renderCount} renders)`))
    }

    console.groupEnd()
  }

  clear() {
    this.renders.clear()
  }
}

export const renderTracker = new RenderTracker()

export function useRenderTracker(componentName: string, reason?: string) {
  const isTracking = useRef(false)

  useEffect(() => {
    if (!isTracking.current) {
      renderTracker.enable()
      isTracking.current = true
    }
  }, [])

  useEffect(() => {
    renderTracker.trackRender(componentName, reason)
  })
}
