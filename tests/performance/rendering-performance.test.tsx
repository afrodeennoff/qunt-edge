import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { performanceMeasurement } from '@/lib/performance/performance-measurement'

const originalRequestAnimationFrame = globalThis.requestAnimationFrame

describe('Rendering Performance Tests', () => {
  beforeAll(() => {
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number
    }) as typeof globalThis.requestAnimationFrame
    performanceMeasurement.clear()
  })

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    performanceMeasurement.clear()
  })

  it('records render budget metrics', () => {
    const end = performanceMeasurement.startMeasurement('render-budget')
    const duration = end()
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('returns memory usage in MB', () => {
    const memory = performanceMeasurement.getMemoryUsage()
    expect(Number.isFinite(memory)).toBe(true)
    expect(memory).toBeGreaterThanOrEqual(0)
  })

  it('measures FPS for a short interval', async () => {
    const fps = await performanceMeasurement.measureFPS(50)
    expect(Number.isFinite(fps)).toBe(true)
    expect(fps).toBeGreaterThanOrEqual(0)
  })
})
