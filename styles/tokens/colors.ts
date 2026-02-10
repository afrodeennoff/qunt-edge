// Color tokens with TypeScript types
export const colorTokens = {
  // Backgrounds - "Terminal" aesthetic
  background: {
    app: '#0B0F14',      // Deep Navy/Black
    panel: '#111722',    // Slightly lighter panel
    card: '#151B24',     // Card background
    canvas: '#BBC4C9',   // Light neutral canvas outside dashboard
    overlay: '#1A212B',  // Modal/Overlay background
  },

  // Borders - Subtle framing
  border: {
    subtle: '#2A313A',
    medium: '#313942',
    strong: '#4B5563',
  },

  // Text - High contrast
  text: {
    primary: '#E8EDF2',   // Off-white
    secondary: '#8D98A5', // Muted Gray
    tertiary: '#626C78',  // Low emphasis
    inverse: '#0B0F14',   // Dark text on light background
  },

  // Semantic - Clear indicators
  semantic: {
    success: '#2FD08A',   // Mint Green
    error: '#D84A57',     // Red
    warning: '#F59E0B',   // Amber
    info: '#3B82F6',      // Blue
  },

  // Accents - Branding
  accent: {
    brandBlue: '#225AEB',
    brandGray: '#565B66',
    brandPurple: '#B62472',
  },

  // Chart - Data visualization
  chart: {
    grid: '#2A313A',
    axis: '#626C78',
    tooltip: '#151B24',
    series: [
      '#D8DEE4', // Series 1 (Pale Gray)
      '#F0F3F6', // Series 2 (White)
      '#8D98A5', // Series 3 (Muted Gray)
      '#2FD08A', // Series 4 (Mint Green)
      '#D84A57', // Series 5 (Red)
    ]
  }
} as const

export type ColorToken = typeof colorTokens
