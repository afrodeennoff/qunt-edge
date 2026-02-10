export const typographyTokens = {
  // Font Families
  fontFamily: {
    mono: 'var(--font-ibm-plex-mono)', // Will be set in globals.css or Next.js config
    sans: 'var(--font-inter)',         // Fallback sans-serif
  },

  // Type Scale - Compact for high data density
  fontSize: {
    'display-lg': '2.25rem',   // 36px
    'display-md': '1.875rem',  // 30px
    'display-sm': '1.5rem',    // 24px
    h1: '1.25rem',             // 20px
    h2: '1.125rem',            // 18px
    h3: '1rem',                // 16px
    body: '0.875rem',          // 14px
    small: '0.75rem',          // 12px
    tiny: '0.625rem',          // 10px
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights - Tight for dense UI
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Letter Spacing - Mono font adjustments
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

export type TypographyToken = typeof typographyTokens
