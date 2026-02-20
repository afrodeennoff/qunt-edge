/**
 * Advanced Font Optimization System
 * 
 * Provides font loading strategies, fallback handling, subsetting,
 * and performance monitoring for @next/font (next/font)
 */

import { Inter, Roboto, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { LocalFont } from 'next/font/local'

/**
 * Font loading strategies
 */
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

/**
 * Optimized font configuration
 */
export interface FontConfig {
  subsets: string[]
  display: FontDisplay
  preload: boolean
  fallback: string[]
  adjustFontFallback: boolean | string
  variable?: string
}

/**
 * Default font configuration for optimal performance
 */
const defaultFontConfig: FontConfig = {
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif'],
  adjustFontFallback: true,
}

/**
 * Primary font - Inter (optimized for UI)
 */
export const interFont = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: 'Arial',
  variable: '--font-inter',
})

/**
 * Secondary font - Roboto (for body text)
 */
export const robotoFont = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: false, // Lazy load
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
  variable: '--font-roboto',
})

/**
 * Display font - Playfair Display (for headings)
 */
export const playfairFont = Playfair_Display({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'optional', // Don't block render
  preload: false,
  fallback: ['Georgia', 'serif'],
  variable: '--font-playfair',
})

/**
 * Monospace font - JetBrains Mono (for code)
 */
export const jetbrainsMonoFont = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
  variable: '--font-mono',
})

/**
 * Local font loader (for custom fonts in /public/fonts)
 */
export function loadLocalFont(
  name: string,
  path: string,
  config: Partial<FontConfig> = {}
) {
  return LocalFont({
    src: path,
    display: config.display || 'swap',
    preload: config.preload ?? false,
    fallback: config.fallback || ['system-ui'],
    variable: config.variable || `--font-${name}`,
  })
}

/**
 * Font subsetting utility for reducing file size
 */
export class FontSubsetter {
  private subsetCache = new Map<string, string>()

  /**
   * Create subset for specific character set
   */
  async createSubset(
    fontUrl: string,
    characters: string,
    format: 'woff2' | 'woff' | 'truetype' = 'woff2'
  ): Promise<string> {
    const cacheKey = `${fontUrl}-${characters}-${format}`
    
    if (this.subsetCache.has(cacheKey)) {
      return this.subsetCache.get(cacheKey)!
    }

    // This would typically use a server-side font subsetting library
    // For now, return the original URL
    // In production, use libraries like 'font-tools' or 'glyphhanger'
    const subsetUrl = fontUrl
    
    this.subsetCache.set(cacheKey, subsetUrl)
    return subsetUrl
  }

  /**
   * Generate character set for specific language
   */
  getCharacterSet(language: string): string {
    const characterSets: Record<string, string> = {
      en: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~ ',
      es: 'áéíóúüñÁÉÍÓÚÜÑ¿¡' + this.getCharacterSet('en'),
      fr: 'àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ' + this.getCharacterSet('en'),
      de: 'äöüßÄÖÜ' + this.getCharacterSet('en'),
      ru: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
      zh: '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严',
    }

    return characterSets[language] || this.getCharacterSet('en')
  }

  clearCache(): void {
    this.subsetCache.clear()
  }
}

export const fontSubsetter = new FontSubsetter()

/**
 * Font loading observer for monitoring
 */
export class FontLoadingObserver {
  private loadedFonts = new Set<string>()
  private failedFonts = new Set<string>()

  /**
   * Monitor font loading
   */
  observe(fontName: string): void {
    if (typeof document === 'undefined') return

    if (!document.fonts) {
      console.warn('Font Loading API not supported')
      return
    }

    document.fonts.load(`16px "${fontName}"`)
      .then(() => {
        this.loadedFonts.add(fontName)
        console.log(`✅ Font loaded: ${fontName}`)
      })
      .catch((error) => {
        this.failedFonts.add(fontName)
        console.error(`❌ Font failed to load: ${fontName}`, error)
      })
  }

  /**
   * Check if font is loaded
   */
  isLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName)
  }

  /**
   * Check if font failed to load
   */
  hasFailed(fontName: string): boolean {
    return this.failedFonts.has(fontName)
  }

  /**
   * Get all loaded fonts
   */
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts)
  }

  /**
   * Get all failed fonts
   */
  getFailedFonts(): string[] {
    return Array.from(this.failedFonts)
  }
}

export const fontObserver = new FontLoadingObserver()

/**
 * Font timeout handler for fallback
 */
export class FontTimeoutHandler {
  private timeouts = new Map<string, NodeJS.Timeout>()

  /**
   * Set timeout for font loading
   */
  setTimeout(fontName: string, timeout: number, callback: () => void): void {
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ Font loading timeout: ${fontName}`)
      callback()
      this.timeouts.delete(fontName)
    }, timeout)

    this.timeouts.set(fontName, timeoutId)
  }

  /**
   * Clear timeout for font
   */
  clearTimeout(fontName: string): void {
    const timeoutId = this.timeouts.get(fontName)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(fontName)
    }
  }

  /**
   * Clear all timeouts
   */
  clearTimeouts(): void {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    this.timeouts.clear()
  }
}

export const fontTimeoutHandler = new FontTimeoutHandler()

/**
 * System font stack as fallback
 */
export const systemFontStack = {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  serif: [
    'Georgia',
    'Times New Roman',
    'Times',
    'serif',
  ],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
}

/**
 * Generate font-face CSS with fallback
 */
export function generateFontFace(
  fontFamily: string,
  src: string,
  options: Partial<FontConfig> = {}
): string {
  const config = { ...defaultFontConfig, ...options }
  
  return `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${src}');
      font-display: ${config.display};
      font-weight: normal;
      font-style: normal;
      ${config.fallback ? `fallback: ${config.fallback.join(', ')};` : ''}
    }
  `
}

/**
 * Critical font subset for above-fold content
 * Preload these for immediate display
 */
export function preloadCriticalFonts(fontUrls: string[]): void {
  if (typeof window === 'undefined') return

  fontUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.href = url
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * Font optimization utilities
 */
export const fontUtils = {
  /**
   * Calculate font loading performance
   */
  measureFontLoadTime(fontName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()

      document.fonts.load(`16px "${fontName}"`)
        .then(() => {
          const endTime = performance.now()
          resolve(endTime - startTime)
        })
        .catch(reject)
    })
  },

  /**
   * Check if font file size is acceptable
   */
  isFontFileSizeAcceptable(sizeKB: number, maxKB = 50): boolean {
    return sizeKB <= maxKB
  },

  /**
   * Generate font variation settings for variable fonts
   */
  generateVariationSettings(
    weight: number = 400,
    stretch: number = 100,
    italic: number = 0
  ): string {
    return `'wght' ${weight}, 'wdth' ${stretch}, 'ital' ${italic}`
  },

  /**
   * Get font feature settings for better rendering
   */
  getFeatureSettings(): string {
    return '"kern" 1, "liga" 1, "calt" 1, "pnum" 1, "tnum" 0, "onum" 1, "lnum" 0, "dlig" 0'
  },
}

/**
 * Font loading strategy configuration
 */
export interface FontLoadingStrategy {
  critical: string[]
  important: string[]
  optional: string[]
}

/**
 * Recommended font loading strategy
 */
export const fontLoadingStrategy: FontLoadingStrategy = {
  // Load immediately (above fold)
  critical: [
    'Inter',
  ],
  // Load after critical (important content)
  important: [
    'Roboto',
  ],
  // Load on demand or when idle
  optional: [
    'Playfair Display',
    'JetBrains Mono',
  ],
}

/**
 * Implement font loading strategy
 */
export function implementFontLoadingStrategy(): void {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  fontLoadingStrategy.critical.forEach(fontName => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Load important fonts
  fontLoadingStrategy.important.forEach(fontName => {
    fontObserver.observe(fontName)
  })

  // Load optional fonts when idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      fontLoadingStrategy.optional.forEach(fontName => {
        fontObserver.observe(fontName)
      })
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      fontLoadingStrategy.optional.forEach(fontName => {
        fontObserver.observe(fontName)
      })
    }, 2000)
  }
}

/**
 * React hook for font loading state
 */
export function useFontLoading(fontName: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      setIsLoading(false)
      return
    }

    document.fonts.load(`16px "${fontName}"`)
      .then(() => {
        setIsLoading(false)
        setHasError(false)
      })
      .catch(() => {
        setIsLoading(false)
        setHasError(true)
      })
  }, [fontName])

  return { isLoading, hasError }
}
