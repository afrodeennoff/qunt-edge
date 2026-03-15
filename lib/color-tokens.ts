/**
 * Centralized Color Token System - LUXURY EDITION
 * Provides semantic color utilities and type-safe token access
 * Premium palette: Champagne Gold, Rose Gold, Deep Obsidian
 */

export type ColorToken = keyof typeof colorTokens;

export const colorTokens = {
  backgrounds: {
    base: '240 8% 1.5%',
    elevated: '240 6% 3%',
    card: '240 6% 4.5%',
    cardHover: '240 5% 6%',
    overlay: '240 5% 8%',
    modal: '240 4% 10%',
    highlight: '240 4% 12%',
  },
  accent: {
    luxury: '35 40% 85%',
    luxuryHover: '35 38% 78%',
    luxuryActive: '35 36% 72%',
    luxurySubtle: '35 40% 85% / 0.1',
    luxuryGlow: '35 40% 85% / 0.2',
    rose: '350 30% 75%',
    roseHover: '350 28% 70%',
    bronze: '30 45% 55%',
  },
  neutral: {
    50: '240 5% 96%',
    100: '240 5% 90%',
    200: '240 4% 80%',
    300: '240 4% 70%',
    400: '240 4% 60%',
    500: '240 5% 50%',
    600: '240 5% 40%',
    700: '240 5% 30%',
    800: '240 4% 20%',
    900: '240 6% 10%',
    950: '240 8% 1.5%',
  },
  foreground: {
    primary: '35 15% 92%',
    secondary: '35 10% 65%',
    tertiary: '35 10% 50%',
    muted: '35 10% 40%',
    disabled: '35 8% 28%',
  },
  border: {
    default: '35 18% 18%',
    subtle: '35 15% 14%',
    strong: '35 20% 22%',
    focus: '35 40% 85%',
    error: '0 40% 35%',
    warning: '35 60% 50%',
    success: '35 40% 85%',
  },
  semantic: {
    success: { fg: '35 15% 92%', bg: '35 40% 85% / 0.1', border: '35 40% 85% / 0.2' },
    warning: { fg: '35 15% 8%', bg: '35 60% 50% / 0.1', border: '35 60% 50% / 0.16' },
    error: { fg: '35 15% 92%', bg: '0 40% 35% / 0.1', border: '0 40% 35% / 0.16' },
    info: { fg: '35 15% 8%', bg: '35 25% 70% / 0.1', border: '35 25% 70% / 0.18' },
    // Back-compat aliases
    errorBg: '0 40% 35% / 0.12',
    warningBg: '35 60% 50% / 0.1',
    successBg: '35 40% 85% / 0.1',
    infoBg: '35 25% 70% / 0.1',
  },
  chart: {
    positive: '35 40% 85%',
    negative: '0 40% 35%',
    neutral: '35 10% 50%',
    c1: '35 40% 85%',
    c2: '35 30% 72%',
    c3: '35 25% 58%',
    c4: '350 30% 75%',
    c5: '30 45% 55%',
    c6: '35 15% 35%',
    c7: '35 12% 25%',
    c8: '35 10% 15%',
  },
} as const;

export type GlassVariant = 'default' | 'strong' | 'subtle';

export interface GlassOptions {
  variant?: GlassVariant;
  opacity?: number;
}

export function getGlassToken(options: GlassOptions = {}): string {
  const { variant = 'default', opacity } = options;

  const baseTokens = {
    default: { bg: '240 6% 3%', opacity: 0.65 },
    strong: { bg: '240 6% 4.5%', opacity: 0.85 },
    subtle: { bg: '240 8% 1.5%', opacity: 0.45 },
  };

  const token = baseTokens[variant];
  const finalOpacity = opacity ?? token.opacity;

  return `hsl(${token.bg} / ${finalOpacity})`;
}

export function getBorderColor(state: 'default' | 'hover' | 'focus' | 'error' = 'default'): string {
  const colors = {
    default: colorTokens.border.default,
    hover: '255 255 255 / 0.1',
    focus: colorTokens.border.focus,
    error: colorTokens.semantic.error.border,
  };
  return `hsl(${colors[state]})`;
}

export function getChartColor(isPositive: boolean | null): string {
  if (isPositive === null) return `hsl(${colorTokens.chart.neutral})`;
  return `hsl(${isPositive ? colorTokens.chart.positive : colorTokens.chart.negative})`;
}

export function getAccentColor(variant: 'primary' | 'hover' | 'active' | 'subtle' = 'primary'): string {
  const colors = {
    primary: colorTokens.accent.luxury,
    hover: colorTokens.accent.luxuryHover,
    active: colorTokens.accent.luxuryActive,
    subtle: colorTokens.accent.luxurySubtle,
  };
  return `hsl(${colors[variant]})`;
}

export function getBackgroundLevel(level: 0 | 1 | 2 | 3 | 4 | 5 | 6): string {
  const levels = [
    colorTokens.backgrounds.base,
    colorTokens.backgrounds.elevated,
    colorTokens.backgrounds.card,
    colorTokens.backgrounds.cardHover,
    colorTokens.backgrounds.overlay,
    colorTokens.backgrounds.modal,
    colorTokens.backgrounds.highlight,
  ];
  return `hsl(${levels[level]})`;
}

export function getForegroundLevel(level: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'disabled'): string {
  return `hsl(${colorTokens.foreground[level]})`;
}

export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

export function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(Number).map((v) => {
      const sRGB = v / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const parseColor = (color: string): string => {
    if (color.startsWith('hsl')) {
      const [h, s, l] = color.match(/\d+/g) || [];
      const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
          const k = (n + h / 30) % 12;
          return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };
        return `${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}`;
      };
      return `rgb(${hslToRgb(Number(h), Number(s), Number(l))})`;
    }
    return color;
  };

  const fgLum = getLuminance(parseColor(foreground));
  const bgLum = getLuminance(parseColor(background));
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(
  foreground: string,
  background: string,
  level: keyof typeof CONTRAST_RATIOS = 'AA_NORMAL'
): boolean {
  return calculateContrastRatio(foreground, background) >= CONTRAST_RATIOS[level];
}
