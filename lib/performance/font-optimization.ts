import { Inter, Geist, IBM_Plex_Mono, Manrope, FontOptions } from 'next/font/google';

export interface FontConfig {
  subsets: string[];
  variable: string;
  display: FontOptions['display'];
  preload: boolean;
  adjustFontFallback: boolean;
}

export const DEFAULT_FONT_CONFIG: Partial<FontConfig> = {
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
};

export const OptimizedFonts = {
  geist: Geist({
    subsets: ['latin'],
    variable: '--font-geist',
    display: 'swap',
    preload: true,
    adjustFontFallback: true,
  }),

  inter: Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    preload: false,
    adjustFontFallback: true,
  }),

  ibmPlexMono: IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-ibm-mono',
    display: 'swap',
    preload: false,
    adjustFontFallback: false,
  }),

  manrope: Manrope({
    subsets: ['latin'],
    variable: '--font-manrope',
    display: 'swap',
    preload: false,
    adjustFontFallback: true,
  }),
} as const;

export const FontVariables = {
  geist: OptimizedFonts.geist.variable,
  inter: OptimizedFonts.inter.variable,
  ibmPlexMono: OptimizedFonts.ibmPlexMono.variable,
  manrope: OptimizedFonts.manrope.variable,
} as const;

export const getFontClassName = (...fonts: (keyof typeof OptimizedFonts)[]) => {
  return fonts.map(font => OptimizedFonts[font].variable).join(' ');
};

export const preloadCriticalFont = (fontName: keyof typeof OptimizedFonts) => {
  return OptimizedFonts[fontName].preload;
};

export const getFontDisplayStrategy = (use: 'display' | 'body' | 'code') => {
  switch (use) {
    case 'display':
      return OptimizedFonts.geist;
    case 'body':
      return OptimizedFonts.inter;
    case 'code':
      return OptimizedFonts.ibmPlexMono;
    default:
      return OptimizedFonts.inter;
  }
};

export const createFontStack = () => {
  return {
    display: `var(--font-geist), system-ui, sans-serif`,
    body: `var(--font-inter), system-ui, sans-serif`,
    mono: `var(--font-ibm-mono), 'Courier New', monospace`,
    accent: `var(--font-manrope), system-ui, sans-serif`,
  };
};

export const getOptimalFontSubset = (locale: string = 'en') => {
  const subsets: Record<string, string[]> = {
    en: ['latin'],
    es: ['latin'],
    fr: ['latin'],
  };
  
  return subsets[locale] || ['latin'];
};

export const configureFontLoading = (priority: 'high' | 'low' = 'low') => {
  return {
    display: 'swap' as const,
    preload: priority === 'high',
    adjustFontFallback: true,
  };
};
