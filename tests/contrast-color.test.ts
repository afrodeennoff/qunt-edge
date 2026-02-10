import { describe, expect, it } from 'vitest'
import { getContrastColor } from '@/lib/utils'

describe('getContrastColor', () => {
  it('returns black for light colors', () => {
    // White -> Black
    expect(getContrastColor('#FFFFFF')).toBe('#000000')
    // White without hash -> Black
    expect(getContrastColor('FFFFFF')).toBe('#000000')
    // Yellow -> Black
    expect(getContrastColor('#FFFF00')).toBe('#000000')
    // Lime -> Black
    expect(getContrastColor('#00FF00')).toBe('#000000')
  })

  it('returns white for dark colors', () => {
    // Black -> White
    expect(getContrastColor('#000000')).toBe('#FFFFFF')
    // Black without hash -> White
    expect(getContrastColor('000000')).toBe('#FFFFFF')
    // Blue -> White
    expect(getContrastColor('#0000FF')).toBe('#FFFFFF')
    // Purple -> White
    expect(getContrastColor('#800080')).toBe('#FFFFFF')
  })

  it('handles lowercase hex codes', () => {
    // white -> Black
    expect(getContrastColor('#ffffff')).toBe('#000000')
    // black -> White
    expect(getContrastColor('#000000')).toBe('#FFFFFF')
  })
})
