import { groupBy } from "@/lib/utils";
import { SerializedTrade } from "@/server/database";
import { getAllTradesForAi } from "@/lib/ai/get-all-trades";
import Decimal from "decimal.js";
import { tool } from "ai";
import { z } from 'zod/v3';

interface TradeSummary {
  accountNumber: string;
  pnl: number;
  commission: number;
  longTrades: number;
  shortTrades: number;
  instruments: string[];
  tradeCount: number;
}

function generateTradeSummary(trades: SerializedTrade[]): TradeSummary[] {
  if (!trades || trades.length === 0) return [];

  const accountGroups = groupBy(trades, 'accountNumber');
  return Object.entries(accountGroups).map(([accountNumber, trades]) => {
    const accountPnL = trades.reduce((sum, trade) => sum.plus(new Decimal(trade.pnl)), new Decimal(0));
    const accountCommission = trades.reduce((sum, trade) => sum.plus(new Decimal(trade.commission)), new Decimal(0));
    const longTrades = trades.filter(t => t.side?.toLowerCase() === 'long').length || 0;
    const shortTrades = trades.filter(t => t.side?.toLowerCase() === 'short').length || 0;
    const instruments = [...new Set(trades.map(t => t.instrument))];

    return {
      accountNumber,
      pnl: accountPnL.minus(accountCommission).toDecimalPlaces(2).toNumber(),
      commission: accountCommission.toDecimalPlaces(2).toNumber(),
      longTrades,
      shortTrades,
      instruments,
      tradeCount: trades.length
    };
  });
}

export const getTradesSummary = tool({
  description: 'Get trades between two dates',
  inputSchema: z.object({
    startDate: z.string().describe('Date string in format 2025-01-14T14:33:01.000Z'),
    endDate: z.string().describe('Date string in format 2025-01-14T14:33:01.000Z')
  }),
  execute: async ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    const tradesResult = await getAllTradesForAi();
    const allTrades = tradesResult.trades;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Invalid startDate or endDate format");
    }
    const filteredTrades = allTrades.filter(trade => {
      const tradeDate = new Date(trade.entryDate);
      return tradeDate >= start && tradeDate <= end;
    });
    const summary = generateTradeSummary(filteredTrades as SerializedTrade[]);
    return {
      items: summary,
      truncated: tradesResult.truncated,
      dataQualityWarning: tradesResult.dataQualityWarning,
    };
  },
})
