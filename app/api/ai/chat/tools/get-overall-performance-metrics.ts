import { SerializedTrade } from "@/server/database";
import { getAiTrades } from "@/lib/ai/trade-access";
import Decimal from "decimal.js";
import { tool } from "ai";
import { z } from 'zod/v3';

interface OverallMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalCommission: number;
  netPnL: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  averageTradeSize: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalVolume: number;
}

function calculateOverallMetrics(trades: SerializedTrade[]): OverallMetrics {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      totalCommission: 0,
      netPnL: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
      averageTradeSize: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      totalVolume: 0
    };
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => new Decimal(t.pnl).gt(0)).length;
  const losingTrades = trades.filter(t => new Decimal(t.pnl).lt(0)).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalPnL = trades.reduce((sum, t) => sum.plus(new Decimal(t.pnl)), new Decimal(0));
  const totalCommission = trades.reduce((sum, t) => sum.plus(new Decimal(t.commission)), new Decimal(0));
  const netPnL = totalPnL.minus(totalCommission);

  const wins = trades.filter(t => new Decimal(t.pnl).gt(0));
  const losses = trades.filter(t => new Decimal(t.pnl).lt(0));

  const averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum.plus(new Decimal(t.pnl)), new Decimal(0)).div(wins.length) : new Decimal(0);
  const averageLoss = losses.length > 0 ? losses.reduce((sum, t) => sum.plus(new Decimal(t.pnl)), new Decimal(0)).div(losses.length).abs() : new Decimal(0);

  const profitFactor = averageLoss.gt(0) ? averageWin.div(averageLoss).toNumber() : 0;

  const largestWin = wins.length > 0 ? Decimal.max(...wins.map(t => new Decimal(t.pnl))) : new Decimal(0);
  const largestLoss = losses.length > 0 ? Decimal.min(...losses.map(t => new Decimal(t.pnl))) : new Decimal(0);

  const averageTradeSize = trades.reduce((sum, t) => sum.plus(new Decimal(t.quantity)), new Decimal(0)).div(totalTrades);
  const totalVolume = trades.reduce((sum, t) => sum.plus(new Decimal(t.quantity)), new Decimal(0));

  // Calculate consecutive wins/losses
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (const trade of trades) {
    const pnl = new Decimal(trade.pnl);
    if (pnl.gt(0)) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else if (pnl.lt(0)) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    }
  }

  // Calculate max drawdown
  let runningPnL = new Decimal(0);
  let peak = new Decimal(0);
  let maxDrawdown = new Decimal(0);

  for (const trade of trades) {
    runningPnL = runningPnL.plus(new Decimal(trade.pnl).minus(new Decimal(trade.commission)));
    if (runningPnL.gt(peak)) {
      peak = runningPnL;
    }
    const drawdown = peak.minus(runningPnL);
    if (drawdown.gt(maxDrawdown)) {
      maxDrawdown = drawdown;
    }
  }

  // Simple Sharpe ratio calculation (assuming risk-free rate of 0)
  const dailyReturns = trades.map(t => new Decimal(t.pnl).minus(new Decimal(t.commission)).toNumber());
  const avgDailyReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
  const stdDev = Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgDailyReturn, 2), 0) / dailyReturns.length);
  const sharpeRatio = stdDev > 0 ? avgDailyReturn / stdDev : 0;

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: Math.round(winRate * 100) / 100,
    totalPnL: totalPnL.toDecimalPlaces(2).toNumber(),
    totalCommission: totalCommission.toDecimalPlaces(2).toNumber(),
    netPnL: netPnL.toDecimalPlaces(2).toNumber(),
    averageWin: averageWin.toDecimalPlaces(2).toNumber(),
    averageLoss: averageLoss.toDecimalPlaces(2).toNumber(),
    profitFactor: Math.round(profitFactor * 100) / 100,
    largestWin: largestWin.toDecimalPlaces(2).toNumber(),
    largestLoss: largestLoss.toDecimalPlaces(2).toNumber(),
    averageTradeSize: averageTradeSize.toNumber(),
    maxConsecutiveWins,
    maxConsecutiveLosses,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: maxDrawdown.toDecimalPlaces(2).toNumber(),
    totalVolume: totalVolume.toNumber()
  };
}

export const getOverallPerformanceMetrics = tool({
  description: 'Get comprehensive overall performance metrics including win rate, profit factor, risk metrics, and trading statistics',
  inputSchema: z.object({
    startDate: z.string().optional().describe('Optional start date to filter trades (format: 2025-01-14T14:33:01.000Z)'),
    endDate: z.string().optional().describe('Optional end date to filter trades (format: 2025-01-14T14:33:01.000Z)')
  }),
  execute: async ({ startDate, endDate }: { startDate?: string, endDate?: string }) => {

    const tradesResult = await getAiTrades({ profile: 'analysis' });
    const allTrades = tradesResult.trades;
    let trades = allTrades;

    // Filter trades by date range if provided
    if (startDate || endDate) {
      trades = trades.filter(trade => {
        const tradeDate = new Date(trade.entryDate);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-01-01');
        return tradeDate >= start && tradeDate <= end;
      });
    }

    const metrics = calculateOverallMetrics(trades as SerializedTrade[]);
    return {
      ...metrics,
      truncated: tradesResult.truncated,
      dataQualityWarning: tradesResult.dataQualityWarning,
    };
  }
}); 
