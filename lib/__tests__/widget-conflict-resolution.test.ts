import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WidgetConflictResolver } from '../widget-conflict-resolution'
import type { DashboardLayoutWithWidgets } from '../../store/user-store'

describe('WidgetConflictResolver', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  const mockLayout: DashboardLayoutWithWidgets = {
    id: 'test-layout',
    userId: 'test-user',
    desktop: [],
    mobile: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should generate a deviceId when none exists', () => {
    const resolver = new WidgetConflictResolver()
    // Using createMetadata to access deviceId indirectly
    const metadata = resolver.createMetadata(mockLayout)

    expect(metadata.deviceId).toBeDefined()
    expect(metadata.deviceId).toMatch(/^device_\d+_[a-z0-9]+$/)

    // Check if it was persisted
    expect(localStorage.getItem('widget_device_id')).toBe(metadata.deviceId)
  })

  it('should use existing deviceId if present', () => {
    const existingId = 'device_existing_123'
    localStorage.setItem('widget_device_id', existingId)

    const resolver = new WidgetConflictResolver()
    const metadata = resolver.createMetadata(mockLayout)

    expect(metadata.deviceId).toBe(existingId)
  })
})
