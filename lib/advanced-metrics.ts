import { Trade } from "@/prisma/generated/prisma";
import { calculateRiskMetricsV1 } from "@/lib/analytics/metrics-v1";

export interface DatePnL {
    date: Date;
    pnl: number;
}

export interface RiskMetrics {
    expectancy: number; // Expectancy per trade
    kellyFull: number; // Full Kelly fraction
    kellyHalf: number; // Half Kelly fraction
    sharpeRatio: number; // Sharpe Ratio (Annualized)
    sortinoRatio: number; // Sortino Ratio (Annualized)
    calmarRatio: number; // Calmar Ratio
    maxDrawdown: number; // Maximum Drawdown ($)
    maxDrawdownPercent: number; // Maximum Drawdown (%)
}

export function calculateAdvancedMetrics(trades: Trade[]): RiskMetrics {
    const metrics = calculateRiskMetricsV1(trades)
    return {
        expectancy: metrics.expectancy,
        kellyFull: metrics.kellyFull,
        kellyHalf: metrics.kellyHalf,
        sharpeRatio: metrics.sharpeRatio,
        sortinoRatio: metrics.sortinoRatio,
        calmarRatio: metrics.calmarRatio,
        maxDrawdown: metrics.maxDrawdown,
        maxDrawdownPercent: metrics.maxDrawdownPercent,
    }
}
