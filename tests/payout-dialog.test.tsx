// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { PayoutDialog } from '@/app/[locale]/dashboard/components/accounts/payout-dialog'

// Mock dependencies
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' })
}))

// Mock useI18n hook
vi.mock('@/locales/client', () => ({
  useI18n: () => (key: string) => key
}))

// Mock ResizeObserver for Recharts or other components if needed
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('PayoutDialog', () => {
  let container: HTMLDivElement | null = null
  let root: any = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container) {
      if (root) {
        act(() => {
          root.unmount()
        })
      }
      document.body.removeChild(container)
      container = null
    }
  })

  it('renders correctly when open', async () => {
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      accountNumber: 'ACC-123',
      onSubmit: vi.fn(),
      existingPayout: undefined
    }

    await act(async () => {
        root = createRoot(container!)
        root.render(<PayoutDialog {...props} />)
    })

    // Wait for any effects and portal rendering
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Check if dialog content is present in the document (Dialog renders into a portal)
    // Since we mocked useI18n to return the key, we look for 'propFirm.payout.add'
    const bodyText = document.body.textContent || ''
    expect(bodyText).toContain('propFirm.payout.add')
    expect(bodyText).toContain('ACC-123')
  })
})
