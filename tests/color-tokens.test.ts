import { describe, it, expect } from 'vitest';
import { calculateContrastRatio, checkContrast } from '@/lib/color-tokens';

describe('Color Tokens', () => {
  describe('calculateContrastRatio', () => {
    it('should calculate contrast ratio for black and white correctly', () => {
      const white = 'rgb(255, 255, 255)';
      const black = 'rgb(0, 0, 0)';

      const ratio = calculateContrastRatio(white, black);
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should be symmetric', () => {
      const color1 = 'rgb(100, 100, 100)';
      const color2 = 'rgb(200, 200, 200)';

      const ratio1 = calculateContrastRatio(color1, color2);
      const ratio2 = calculateContrastRatio(color2, color1);

      expect(ratio1).toBe(ratio2);
    });

    it('should handle HSL colors correctly', () => {
      // White in HSL
      const white = 'hsl(0 0% 100%)';
      // Black in HSL
      const black = 'hsl(0 0% 0%)';

      const ratio = calculateContrastRatio(white, black);
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should handle decimal values in HSL colors correctly', () => {
      // 50.5% lightness vs 100% lightness (white)
      // If 50.5 is truncated to 50, contrast will be slightly different but close.
      // However, if 3.9 is truncated to 3, it's a bigger issue for dark colors.

      // Let's test a case where decimals matter significantly.
      // HSL(0, 0%, 50.5%) vs HSL(0, 0%, 50%).
      // If 50.5 is parsed as 50, the ratio will be 1.

      const gray50_5 = 'hsl(0 0% 50.5%)';
      const gray50 = 'hsl(0 0% 50%)';

      const ratio = calculateContrastRatio(gray50_5, gray50);

      // If they are parsed the same, ratio is 1.
      // If parsed correctly, ratio > 1.
      expect(ratio).not.toBe(1);
    });

    it('should handle decimal values in RGB colors correctly', () => {
      // RGB values are typically integers 0-255, but the spec allows decimals/percentages.
      // rgb(127.5, 127.5, 127.5) should be distinct from rgb(127, 127, 127)

      const gray127_5 = 'rgb(127.5, 127.5, 127.5)';
      const gray127 = 'rgb(127, 127, 127)';

      const ratio = calculateContrastRatio(gray127_5, gray127);
      expect(ratio).not.toBe(1);
    });

    it('should calculate contrast ratio for known color pairs', () => {
      // Blue (#0000FF) vs White (#FFFFFF) -> 8.59:1
      const blue = 'rgb(0, 0, 255)';
      const white = 'rgb(255, 255, 255)';

      const ratio = calculateContrastRatio(blue, white);
      expect(ratio).toBeCloseTo(8.59, 1);
    });

    it('should handle invalid input gracefully (returns 1 or handles error)', () => {
        // Current implementation returns 0 from getLuminance if match fails
        // If both return 0 luminance, ratio is (0+0.05)/(0+0.05) = 1.
        const invalid = 'invalid-color';
        const white = 'rgb(255, 255, 255)';

        const ratio = calculateContrastRatio(invalid, white);
        // Luminance of invalid is 0 (black equivalent).
        // Luminance of white is 1.
        // Ratio = (1 + 0.05) / (0 + 0.05) = 21.
        expect(ratio).toBeCloseTo(21, 1);
    });
  });

  describe('checkContrast', () => {
    it('should return true for sufficient contrast', () => {
      const white = 'rgb(255, 255, 255)';
      const black = 'rgb(0, 0, 0)';

      expect(checkContrast(white, black, 'AA_NORMAL')).toBe(true);
    });

    it('should return false for insufficient contrast', () => {
      const gray1 = 'rgb(100, 100, 100)';
      const gray2 = 'rgb(110, 110, 110)';

      expect(checkContrast(gray1, gray2, 'AA_NORMAL')).toBe(false);
    });
  });
});
