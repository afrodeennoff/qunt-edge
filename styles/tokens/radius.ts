export const radiusTokens = {
  // Border Radius - Rounded medium
  'radius-none': '0px',
  'radius-sm': '4px',
  'radius-md': '8px',
  'radius-lg': '12px',
  'radius-xl': '16px',
  'radius-full': '9999px',
} as const

export type RadiusToken = typeof radiusTokens
