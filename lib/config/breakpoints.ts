export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

export const MOBILE_BREAKPOINT = BREAKPOINTS.md - 1

export function getMinWidthQuery(breakpoint: BreakpointKey): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`
}

export function getMaxWidthQuery(breakpoint: BreakpointKey): string {
  return `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`
}

export function getResponsiveQuery(
  minBreakpoint?: BreakpointKey,
  maxBreakpoint?: BreakpointKey
): string {
  const parts: string[] = []
  
  if (minBreakpoint) {
    parts.push(getMinWidthQuery(minBreakpoint))
  }
  
  if (maxBreakpoint) {
    parts.push(getMaxWidthQuery(maxBreakpoint))
  }
  
  return parts.join(' and ')
}
