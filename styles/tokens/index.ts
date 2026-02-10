// Export all design tokens from a central location

import { colorTokens } from './colors'
import { typographyTokens } from './typography'
import { spacingTokens } from './spacing'
import { radiusTokens } from './radius'

export const tokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
} as const

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './radius'
