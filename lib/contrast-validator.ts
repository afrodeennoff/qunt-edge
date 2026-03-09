import { calculateContrastRatio, checkContrast, CONTRAST_RATIOS } from './color-tokens';

export interface ValidationResult {
  isValid: boolean;
  ratio: number;
  required: number;
  level: string;
  foreground: string;
  background: string;
}

export interface ColorPair {
  name: string;
  foreground: string;
  background: string;
}

export const predefinedColorPairs: ColorPair[] = [
  { name: 'Primary on Base', foreground: 'hsl(0 0% 98%)', background: 'hsl(240 10% 3.9%)' },
  { name: 'Secondary on Base', foreground: 'hsl(240 5% 65%)', background: 'hsl(240 10% 3.9%)' },
  { name: 'Teal on Base', foreground: 'hsl(173 58% 39%)', background: 'hsl(240 10% 3.9%)' },
  { name: 'Error on Base', foreground: 'hsl(0 62% 50%)', background: 'hsl(240 10% 3.9%)' },
  { name: 'Primary on Card', foreground: 'hsl(0 0% 98%)', background: 'hsl(240 10% 7%)' },
  { name: 'Teal on Card', foreground: 'hsl(173 58% 39%)', background: 'hsl(240 10% 7%)' },
  { name: 'Muted on Base', foreground: 'hsl(240 5% 45%)', background: 'hsl(240 10% 3.9%)' },
  { name: 'Disabled on Base', foreground: 'hsl(240 5% 25%)', background: 'hsl(240 10% 3.9%)' },
];

export function validateColorPair(
  foreground: string,
  background: string,
  level: keyof typeof CONTRAST_RATIOS = 'AA_NORMAL'
): ValidationResult {
  const ratio = calculateContrastRatio(foreground, background);
  const required = CONTRAST_RATIOS[level];

  return {
    isValid: ratio >= required,
    ratio,
    required,
    level,
    foreground,
    background,
  };
}

export function validateAllColorPairs(
  colorPairs: ColorPair[] = predefinedColorPairs,
  level: keyof typeof CONTRAST_RATIOS = 'AA_NORMAL'
): ValidationResult[] {
  return colorPairs.map(pair => 
    validateColorPair(pair.foreground, pair.background, level)
  );
}

export function generateContrastReport(
  results: ValidationResult[]
): {
  passed: ValidationResult[];
  failed: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
} {
  const passed = results.filter(r => r.isValid);
  const failed = results.filter(r => !r.isValid);

  return {
    passed,
    failed,
    summary: {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      passRate: (passed.length / results.length) * 100,
    },
  };
}

export function getContrastLevel(foreground: string, background: string): {
  AA: { normal: boolean; large: boolean };
  AAA: { normal: boolean; large: boolean };
  ratio: number;
} {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    AA: {
      normal: ratio >= CONTRAST_RATIOS.AA_NORMAL,
      large: ratio >= CONTRAST_RATIOS.AA_LARGE,
    },
    AAA: {
      normal: ratio >= CONTRAST_RATIOS.AAA_NORMAL,
      large: ratio >= CONTRAST_RATIOS.AAA_LARGE,
    },
    ratio,
  };
}

export function testComponentContrast(
  componentName: string,
  colors: Record<string, { foreground: string; background: string }>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [key, value] of Object.entries(colors)) {
    results[key] = validateColorPair(value.foreground, value.background);
  }

  return results;
}

export const componentContrastTests = {
  button: {
    default: { foreground: 'hsl(0 0% 98%)', background: 'hsl(0 0% 9%)' },
    primary: { foreground: 'hsl(0 0% 9%)', background: 'hsl(173 58% 39%)' },
    destructive: { foreground: 'hsl(0 0% 98%)', background: 'hsl(0 62% 50%)' },
    outline: { foreground: 'hsl(0 0% 98%)', background: 'hsl(240 10% 3.9%)' },
    ghost: { foreground: 'hsl(240 5% 65%)', background: 'transparent' },
  },
  card: {
    default: { foreground: 'hsl(0 0% 98%)', background: 'hsl(240 10% 7%)' },
    muted: { foreground: 'hsl(240 5% 65%)', background: 'hsl(240 10% 7%)' },
  },
  text: {
    primary: { foreground: 'hsl(0 0% 98%)', background: 'hsl(240 10% 3.9%)' },
    secondary: { foreground: 'hsl(240 5% 65%)', background: 'hsl(240 10% 3.9%)' },
    tertiary: { foreground: 'hsl(240 5% 45%)', background: 'hsl(240 10% 3.9%)' },
  },
} as const;

export function runAllContrastTests(): Record<string, Record<string, ValidationResult>> {
  return {
    button: testComponentContrast('button', componentContrastTests.button),
    card: testComponentContrast('card', componentContrastTests.card),
    text: testComponentContrast('text', componentContrastTests.text),
  };
}
