export const spacingTokens = {
  // Spacing Scale - Tight 4px base
  '3xs': '0.125rem', // 2px
  '2xs': '0.25rem',  // 4px
  xs: '0.5rem',      // 8px
  sm: '0.75rem',     // 12px
  md: '1rem',        // 16px
  lg: '1.25rem',     // 20px
  xl: '1.5rem',      // 24px
  '2xl': '2rem',     // 32px
  '3xl': '3rem',     // 48px

  // Component-specific
  cardPadding: {
    compact: '0.75rem',
    normal: '1rem',
    relaxed: '1.5rem',
  },

  gridGap: {
    tight: '0.5rem',
    normal: '1rem',
    wide: '1.5rem',
  },
} as const

export type SpacingToken = typeof spacingTokens
