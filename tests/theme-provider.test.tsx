// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from '@/context/theme-provider'

function ThemeProbe() {
  const { theme, effectiveTheme, toggleTheme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="effectiveTheme">{effectiveTheme}</span>
      <button data-testid="toggleTheme" onClick={toggleTheme} type="button">
        toggle
      </button>
      <button data-testid="setSystem" onClick={() => setTheme('system')} type="button">
        system
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
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
    localStorage.clear()
  })

  it('resolves system theme and toggles from effective system theme', async () => {
    localStorage.setItem('theme', 'system')

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root!.render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      )
    })

    const theme = container.querySelector('[data-testid="theme"]')
    const effectiveTheme = container.querySelector('[data-testid="effectiveTheme"]')
    const toggleTheme = container.querySelector('[data-testid="toggleTheme"]') as HTMLButtonElement

    expect(theme?.textContent).toBe('system')
    expect(effectiveTheme?.textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await act(async () => {
      toggleTheme.click()
    })

    expect(theme?.textContent).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
