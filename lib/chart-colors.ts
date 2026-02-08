import { getChartColor } from "./color-tokens";

export interface ChartColorConfig {
  positive: string;
  negative: string;
  neutral: string;
  palette: string[];
}

export const chartColors: ChartColorConfig = {
  positive: 'hsl(173 58% 39%)',
  negative: 'hsl(0 62% 55%)',
  neutral: 'hsl(240 5% 50%)',
  palette: [
    'hsl(217 91% 60%)',
    'hsl(173 58% 39%)',
    'hsl(197 55% 60%)',
    'hsl(43 85% 60%)',
    'hsl(27 85% 60%)',
    'hsl(206 80% 60%)',
    'hsl(260 65% 65%)',
    'hsl(336 70% 65%)',
  ],
};

export function getPnLColor(value: number): string {
  if (value === 0) return chartColors.neutral;
  return value > 0 ? chartColors.positive : chartColors.negative;
}

export function getPnLColorWithOpacity(value: number, opacity: number = 0.1): string {
  const baseColor = getPnLColor(value);
  return baseColor.replace(')', ` / ${opacity})`).replace('hsl', 'hsl');
}

export function getChartColorByIndex(index: number): string {
  return chartColors.palette[index % chartColors.palette.length];
}

export function getChartColorGradient(isPositive: boolean | null): string {
  const color = isPositive === null 
    ? chartColors.neutral 
    : isPositive 
      ? chartColors.positive 
      : chartColors.negative;
  
  return `linear-gradient(135deg, ${color}00 0%, ${color}20 100%)`;
}

export const chartColorMap = {
  positive: 'chart-positive',
  negative: 'chart-negative',
  neutral: 'chart-neutral',
  1: 'chart-1',
  2: 'chart-2',
  3: 'chart-3',
  4: 'chart-4',
  5: 'chart-5',
  6: 'chart-6',
  7: 'chart-7',
  8: 'chart-8',
} as const;

export type ChartColorToken = keyof typeof chartColorMap;

export function getChartColorClass(token: ChartColorToken): string {
  return `text-${chartColorMap[token]}`;
}

export function getChartBgClass(token: ChartColorToken, opacity: number = 0.1): string {
  return `bg-${chartColorMap[token]}/${Math.round(opacity * 100)}`;
}
