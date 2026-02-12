// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AppError from '@/app/error'
import DashboardError from '@/app/[locale]/dashboard/error'

describe('Error boundaries', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
    }
    container?.remove()
    container = null
    root = null
  })

  it('renders app fallback and calls reset', async () => {
    const reset = vi.fn()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(<AppError error={new Error('boom')} reset={reset} />)
    })

    expect(container.textContent).toContain('Something went wrong')
    expect(container.textContent).toContain('boom')

    const button = Array.from(container.querySelectorAll('button')).find((node) =>
      node.textContent?.includes('Try again'),
    ) as HTMLButtonElement

    await act(async () => {
      button.click()
    })

    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('renders dashboard fallback and calls reset', async () => {
    const reset = vi.fn()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(<DashboardError error={new Error('widget failed')} reset={reset} />)
    })

    expect(container.textContent).toContain('Dashboard failed to load')
    expect(container.textContent).toContain('widget failed')

    const button = Array.from(container.querySelectorAll('button')).find((node) =>
      node.textContent?.includes('Reload dashboard'),
    ) as HTMLButtonElement

    await act(async () => {
      button.click()
    })

    expect(reset).toHaveBeenCalledTimes(1)
  })
})
