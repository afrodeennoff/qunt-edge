'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, startTransition } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ColorTheme = 'default' | 'tiesen'

type ThemeContextType = {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  colorTheme: ColorTheme
  intensity: number
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  setIntensity: (intensity: number) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  effectiveTheme: 'dark',
  colorTheme: 'default',
  intensity: 100,
  setTheme: () => { },
  setColorTheme: () => { },
  setIntensity: () => { },
  toggleTheme: () => { },
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark')
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('default')
  const [intensity, setIntensityState] = useState<number>(100)

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let newEffectiveTheme: 'light' | 'dark' = 'light'
    if (newTheme === 'system') {
      newEffectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      newEffectiveTheme = newTheme
    }

    root.classList.add(newEffectiveTheme)
    setEffectiveTheme(newEffectiveTheme)
  }

  const applyColorTheme = (newColorTheme: ColorTheme) => {
    const root = window.document.documentElement
    if (newColorTheme === 'tiesen') {
      root.setAttribute('data-theme', 'tiesen')
    } else {
      root.removeAttribute('data-theme')
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedIntensity = localStorage.getItem('intensity')
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme | null

    startTransition(() => {
      if (savedTheme) {
        setThemeState(savedTheme)
      }
      if (savedIntensity) {
        setIntensityState(Number(savedIntensity))
      }
      if (savedColorTheme) {
        setColorThemeState(savedColorTheme)
      }
    })
    applyTheme(savedTheme || 'system')
    if (savedColorTheme) {
      applyColorTheme(savedColorTheme)
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      applyTheme(theme)
    })
    localStorage.setItem('theme', theme)
    localStorage.setItem('intensity', intensity.toString())

    const root = window.document.documentElement
    root.style.setProperty('--theme-intensity', `${intensity}%`)
  }, [theme, intensity])

  useEffect(() => {
    startTransition(() => {
      applyColorTheme(colorTheme)
    })
    localStorage.setItem('colorTheme', colorTheme)
  }, [colorTheme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme)
  }

  const setIntensity = (newIntensity: number) => {
    setIntensityState(newIntensity)
  }

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      if (prevTheme === 'system') {
        return effectiveTheme === 'light' ? 'dark' : 'light'
      }
      return prevTheme === 'light' ? 'dark' : 'light'
    })
  }

  const value = useMemo(() => ({
    theme,
    effectiveTheme,
    colorTheme,
    intensity,
    setTheme,
    setColorTheme,
    setIntensity,
    toggleTheme,
  }), [theme, effectiveTheme, colorTheme, intensity])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
