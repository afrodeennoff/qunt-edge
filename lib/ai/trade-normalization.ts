import type { SerializedTrade } from "@/server/database"
import { decimalToNumber } from "@/lib/trade-types"
import { toValidDate } from "@/lib/date-utils"

export interface AnalyticsTrade {
  id: string
  accountNumber: string
  userId: string
  instrument: string
  side: string | null
  quantity: number
  entryPrice: number
  closePrice: number
  pnl: number
  commission: number
  entryDate: Date
  closeDate: Date | null
  timeInPosition: number
}

export function normalizeTrade(trade: SerializedTrade): AnalyticsTrade {
  return {
    id: trade.id,
    accountNumber: trade.accountNumber,
    userId: trade.userId,
    instrument: trade.instrument,
    side: trade.side,
    quantity: decimalToNumber(trade.quantity),
    entryPrice: decimalToNumber(trade.entryPrice),
    closePrice: decimalToNumber(trade.closePrice),
    pnl: decimalToNumber(trade.pnl),
    commission: decimalToNumber(trade.commission),
    entryDate: toValidDate(trade.entryDate) || new Date(0),
    closeDate: toValidDate(trade.closeDate),
    timeInPosition: decimalToNumber(trade.timeInPosition),
  }
}

export function normalizeTrades(trades: SerializedTrade[]): AnalyticsTrade[] {
  return trades.map(normalizeTrade)
}

export function tradeNetPnl(trade: Pick<AnalyticsTrade, "pnl" | "commission">): number {
  return trade.pnl - trade.commission
}
