import { describe, it, expect } from 'vitest'
import { widgetEncryptionService } from '../widget-encryption'
import { Widget } from '@/app/[locale]/dashboard/types/dashboard'
import { DashboardLayoutWithWidgets } from '@/store/user-store'

describe('Widget Encryption Service', () => {
  const mockWidget: Widget = {
    i: 'sensitive-id-123',
    type: 'equityChart',
    size: 'medium',
    x: 0,
    y: 0,
    w: 1,
    h: 1
  }

  const mockLayout: DashboardLayoutWithWidgets = {
    id: 'layout-1',
    userId: 'user-123',
    desktop: [mockWidget],
    mobile: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should encrypt sensitive fields using AES-GCM', async () => {
    // Encrypt
    const encryptedLayout = await widgetEncryptionService.encryptLayoutData(mockLayout)
    const encryptedWidget = encryptedLayout.desktop[0]

    // Calculate simple base64 (what it used to be)
    const simpleBase64 = btoa(encodeURIComponent('sensitive-id-123'))

    // 1. It should NOT be the simple base64 anymore
    expect(encryptedWidget.i).not.toBe(simpleBase64)

    // 2. It should look like base64
    expect(encryptedWidget.i).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)

    // 3. Since IV is random, subsequent encryptions should produce different outputs for same input
    const encryptedLayout2 = await widgetEncryptionService.encryptLayoutData(mockLayout)
    expect(encryptedLayout2.desktop[0].i).not.toBe(encryptedWidget.i)
  })

  it('should decrypt correctly', async () => {
    // Encrypt then decrypt
    const encryptedLayout = await widgetEncryptionService.encryptLayoutData(mockLayout)
    const decryptedLayout = await widgetEncryptionService.decryptLayoutData(encryptedLayout)

    expect(decryptedLayout.desktop[0].i).toBe('sensitive-id-123')
  })

  it('should support legacy base64 data fallback', async () => {
    // Create a layout with legacy base64 encoded ID
    const legacyId = 'legacy-id-456'
    const encodedId = btoa(encodeURIComponent(legacyId))

    const legacyWidget: Widget = {
      ...mockWidget,
      i: encodedId
    }

    const legacyLayout: DashboardLayoutWithWidgets = {
      ...mockLayout,
      desktop: [legacyWidget]
    }

    // Try to decrypt it using the new service
    const decryptedLayout = await widgetEncryptionService.decryptLayoutData(legacyLayout)

    // It should fallback to base64 decoding and recover the ID
    expect(decryptedLayout.desktop[0].i).toBe(legacyId)
  })
})
