/**
 * Centralized Color Token System
 * Provides semantic color utilities and type-safe token access
 */

export type ColorToken = keyof typeof colorTokens;

export const colorTokens = {
  backgrounds: {
    base: '240 10% 3.9%',
    elevated: '240 10% 5%',
    card: '240 10% 7%',
    cardHover: '240 10% 9%',
    overlay: '240 10% 11%',
    modal: '240 10% 13%',
    highlight: '240 10% 15%',
  },
  accent: {
    teal: '173 58% 39%',
    tealHover: '173 58% 44%',
    tealActive: '173 58% 34%',
    tealSubtle: '173 58% 39% / 0.1',
    tealGlow: '173 58% 39% / 0.3',
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
    950: '240 10% 3.9%',
  },
  foreground: {
    primary: '0 0% 98%',
    secondary: '240 5% 65%',
    tertiary: '240 5% 45%',
    muted: '240 5% 35%',
    disabled: '240 5% 25%',
  },
  border: {
    default: '240 4% 20%',
    subtle: '240 4% 15%',
    strong: '240 4% 25%',
    focus: '173 58% 39%',
    error: '0 62% 50%',
    warning: '35 85% 55%',
    success: '173 58% 39%',
  },
  semantic: {
    error: '0 62% 50%',
    errorBg: '0 62% 50% / 0.1',
    warning: '35 85% 55%',
    warningBg: '35 85% 55% / 0.1',
    success: '173 58% 39%',
    successBg: '173 58% 39% / 0.1',
    info: '217 91% 60%',
    infoBg: '217 91% 60% / 0.1',
  },
  chart: {
    positive: '173 58% 39%',
    negative: '0 62% 55%',
    neutral: '240 5% 50%',
    c1: '217 91% 60%',
    c2: '173 58% 39%',
    c3: '197 55% 60%',
    c4: '43 85% 60%',
    c5: '27 85% 60%',
    c6: '206 80% 60%',
    c7: '260 65% 65%',
    c8: '336 70% 65%',
  },
} as const;

export type GlassVariant = 'default' | 'strong' | 'subtle';

export interface GlassOptions {
  variant?: GlassVariant;
  blur?: number;
  opacity?: number;
}

export function getGlassToken(options: GlassOptions = {}): string {
  const { variant = 'default', blur = 20, opacity } = options;

  const baseTokens = {
    default: { bg: '240 10% 5%', opacity: 0.6 },
    strong: { bg: '240 10% 7%', opacity: 0.8 },
    subtle: { bg: '240 10% 3.9%', opacity: 0.4 },
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
    error: colorTokens.border.error,
  };
  return `hsl(${colors[state]})`;
}

export function getChartColor(isPositive: boolean | null): string {
  if (isPositive === null) return `hsl(${colorTokens.chart.neutral})`;
  return `hsl(${isPositive ? colorTokens.chart.positive : colorTokens.chart.negative})`;
}

export function getAccentColor(variant: 'primary' | 'hover' | 'active' | 'subtle' = 'primary'): string {
  const colors = {
    primary: colorTokens.accent.teal,
    hover: colorTokens.accent.tealHover,
    active: colorTokens.accent.tealActive,
    subtle: colorTokens.accent.tealSubtle,
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
