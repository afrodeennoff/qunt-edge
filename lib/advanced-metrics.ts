import { Trade } from "@/prisma/generated/prisma";
import { startOfDay, differenceInDays } from "date-fns";
import { addMoney, netPnl, toDecimal, toMoneyNumber } from "@/lib/financial-math";

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
    if (!trades || trades.length === 0) {
        return {
            expectancy: 0,
            kellyFull: 0,
            kellyHalf: 0,
            sharpeRatio: 0,
            sortinoRatio: 0,
            calmarRatio: 0,
            maxDrawdown: 0,
            maxDrawdownPercent: 0,
        };
    }

    // --- Expectancy & Kelly ---
    const wins = trades.filter((t) => netPnl(t.pnl ?? 0, t.commission ?? 0).gt(0));
    const losses = trades.filter((t) => netPnl(t.pnl ?? 0, t.commission ?? 0).lte(0));
    const nbWins = wins.length;
    const nbLosses = losses.length;
    const grossWin = wins.reduce((acc, t) => addMoney(acc, netPnl(t.pnl ?? 0, t.commission ?? 0)), toDecimal(0));
    const grossLoss = losses.reduce((acc, t) => addMoney(acc, netPnl(t.pnl ?? 0, t.commission ?? 0).abs()), toDecimal(0));
    const avgWin = nbWins > 0 ? grossWin.div(nbWins).toNumber() : 0;
    const avgLoss = nbLosses > 0 ? grossLoss.div(nbLosses).toNumber() : 0;
    const winRate = trades.length > 0 ? nbWins / trades.length : 0;
    const lossRate = trades.length > 0 ? nbLosses / trades.length : 0;

    const expectancy = (avgWin * winRate) - (avgLoss * lossRate);

    // Kelly
    // b = AvgWin / AvgLoss
    const b = avgLoss > 0 ? avgWin / avgLoss : 0;
    const kellyFull = b > 0 ? winRate - ((1 - winRate) / b) : 0;
    const kellyHalf = kellyFull * 0.5;


    // --- Time Series Metrics (Sharpe, Sortino, Calmar, Drawdown) ---
    // Group trades by day to get daily returns
    const dailyPnLs = new Map<string, number>();

    trades.forEach(trade => {
        const dateKey = startOfDay(new Date(trade.entryDate)).toISOString();
        const current = dailyPnLs.get(dateKey) || 0;
        dailyPnLs.set(dateKey, toMoneyNumber(addMoney(current, netPnl(trade.pnl ?? 0, trade.commission ?? 0)), 8));
    });

    const dailyReturns = Array.from(dailyPnLs.values());
    const nbDays = dailyReturns.length;

    if (nbDays === 0) {
        return { expectancy, kellyFull, kellyHalf, sharpeRatio: 0, sortinoRatio: 0, calmarRatio: 0, maxDrawdown: 0, maxDrawdownPercent: 0 };
    }

    // Mean Daily Return
    const meanDailyReturn = dailyReturns.reduce((sum, val) => sum + val, 0) / nbDays;

    // Standard Deviation (Volatility)
    const variance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - meanDailyReturn, 2), 0) / nbDays;
    const stdDev = Math.sqrt(variance);

    // Sharpe Ratio (Annualized) - Assuming risk-free rate 0 for simplicity
    // Sharpe = (MeanReturn / StdDev) * sqrt(252)
    const sharpeRatio = stdDev > 0 ? (meanDailyReturn / stdDev) * Math.sqrt(252) : 0;


    // Sortino Ratio
    // Downside Deviation
    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideVariance = downsideReturns.reduce((sum, val) => sum + Math.pow(val, 2), 0) / nbDays; // Dividing by total days usually
    const downsideDev = Math.sqrt(downsideVariance);
    const sortinoRatio = downsideDev > 0 ? (meanDailyReturn / downsideDev) * Math.sqrt(252) : 0;


    // Tie MaxDrawdown (Absolute dollar amount)
    // We need an equity curve to calculate Max Drawdown correctly over time
    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    let peak = toDecimal(0);
    let maxDrawdown = toDecimal(0);
    let runningPnl = toDecimal(0); // Cumulative PnL from start of period

    // Note: This calculate DD based on PnL curve, not account equity (unless we knew starting balance). 
    // We will assume a relative drawdown from the peak of the PnL curve.

    sortedTrades.forEach(t => {
        runningPnl = addMoney(runningPnl, netPnl(t.pnl ?? 0, t.commission ?? 0));
        if (runningPnl.gt(peak)) {
            peak = runningPnl;
        }
        const dd = peak.minus(runningPnl);
        if (dd.gt(maxDrawdown)) {
            maxDrawdown = dd;
        }
    });

    // Calmar Ratio = Annualized Return / Max Drawdown
    // To get Annualized Return: Total Return / Years
    const totalReturn = runningPnl.toNumber(); // Sum of PnL

    // Calculate duration in days, avoid division by zero
    const durationInDays = differenceInDays(new Date(sortedTrades[sortedTrades.length - 1].entryDate), new Date(sortedTrades[0].entryDate)) + 1;
    const years = durationInDays / 365.25;
    const annualizedReturn = years > 0 ? totalReturn / years : totalReturn; // Fallback if < 1 year? usually totalReturn

    const maxDrawdownNumber = maxDrawdown.toNumber();
    const calmarRatio = maxDrawdownNumber > 0 ? annualizedReturn / maxDrawdownNumber : 0;

    return {
        expectancy,
        kellyFull,
        kellyHalf,
        sharpeRatio,
        sortinoRatio,
        calmarRatio,
        maxDrawdown: maxDrawdownNumber,
        maxDrawdownPercent: 0 // Cannot calc without balance
    };
}
