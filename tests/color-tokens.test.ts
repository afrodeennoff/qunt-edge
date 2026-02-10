import { describe, expect, it } from 'vitest'
import { calculateContrastRatio, checkContrast } from '@/lib/color-tokens'

describe('color-tokens', () => {
  describe('calculateContrastRatio', () => {
    it('returns 21 for black on white', () => {
      const ratio = calculateContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)')
      expect(ratio).toBeCloseTo(21, 1)
    })

    it('returns 21 for white on black', () => {
      const ratio = calculateContrastRatio('rgb(255, 255, 255)', 'rgb(0, 0, 0)')
      expect(ratio).toBeCloseTo(21, 1)
    })

    it('returns 1 for same colors', () => {
      const ratio = calculateContrastRatio('rgb(100, 100, 100)', 'rgb(100, 100, 100)')
      expect(ratio).toBeCloseTo(1, 1)
    })

    it('handles HSL input correctly', () => {
      // White in HSL
      const ratio = calculateContrastRatio('hsl(0, 0%, 0%)', 'hsl(0, 0%, 100%)')
      expect(ratio).toBeCloseTo(21, 1)
    })

    it('handles mixed formats (HSL and RGB)', () => {
        const ratio = calculateContrastRatio('hsl(0, 0%, 0%)', 'rgb(255, 255, 255)')
        expect(ratio).toBeCloseTo(21, 1)
    })

    it('handles HSL to RGB conversion correctly for non-grayscale', () => {
      // Red: hsl(0, 100%, 50%) -> rgb(255, 0, 0)
      // White: rgb(255, 255, 255)
      // Contrast for Red on White is approx 3.99
      const ratio = calculateContrastRatio('hsl(0, 100%, 50%)', 'rgb(255, 255, 255)')
      expect(ratio).toBeCloseTo(4, 0.1)
    })

     it('handles raw numbers as RGB if that is how implementation works (implicit)', () => {
       // "0 0 0" -> black
       // "255 255 255" -> white
       const ratio = calculateContrastRatio('0 0 0', '255 255 255')
       expect(ratio).toBeCloseTo(21, 1)
    })

    it('returns 1 for invalid input leading to 0 luminance fallback', () => {
        // "invalid" -> luminance 0
        // "invalid" -> luminance 0
        // (0+0.05)/(0+0.05) = 1
        expect(calculateContrastRatio('invalid', 'invalid')).toBe(1)
    })
  })

  describe('checkContrast', () => {
    it('returns true when contrast meets level', () => {
      // Black on White is 21. AA_NORMAL is 4.5
      expect(checkContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'AA_NORMAL')).toBe(true)
    })

    it('returns false when contrast fails level', () => {
      expect(checkContrast('rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'AA_NORMAL')).toBe(false)
    })

    it('defaults to AA_NORMAL if level not provided', () => {
         expect(checkContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBe(true)
    })

    it('respects different contrast levels', () => {
        // AAA_NORMAL is 7
        // Red on White is ~4.0. Should fail AAA_NORMAL but fail AA_NORMAL too? No AA_NORMAL is 4.5
        // Let's use Grey on White.
        // #777 (119, 119, 119) on White.
        // L(119) ~ 0.18
        // (1 + 0.05) / (0.18 + 0.05) ~ 4.56.
        // So 119,119,119 on 255,255,255 is > 4.5.
        // Should pass AA_NORMAL.
        // Should fail AAA_NORMAL (7).

        const grey = 'rgb(119, 119, 119)'
        const white = 'rgb(255, 255, 255)'

        // Let's verify exact ratio for 119.
        // 119/255 = 0.466
        // ((0.466+0.055)/1.055)^2.4 = 0.184
        // (1.05)/(0.184+0.05) = 4.48.
        // Wait, 4.48 < 4.5. So it should fail AA_NORMAL.

        // Let's try 118.
        // 118/255 = 0.462.
        // L = 0.181
        // Ratio = 1.05 / 0.231 = 4.54.

        const darkerGrey = 'rgb(118, 118, 118)'
        expect(checkContrast(darkerGrey, white, 'AA_NORMAL')).toBe(true)
        expect(checkContrast(darkerGrey, white, 'AAA_NORMAL')).toBe(false)
    })
  })
})
