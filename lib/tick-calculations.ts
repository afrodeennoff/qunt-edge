import type { Trade } from '@/lib/data-types'
import type { TickDetails } from '@/prisma/generated/prisma'

export interface TickCalculation {
  ticks: number
  points: number
  tickValue: number
  tickSize: number
}

// Cache for sorted keys of tickDetails objects
// WeakMap ensures that if the tickDetails object is garbage collected, the cache entry is also removed
const sortedKeysCache = new WeakMap<object, string[]>()

function getSortedKeys(tickDetails: Record<string, TickDetails>): string[] {
  let keys = sortedKeysCache.get(tickDetails)
  if (!keys) {
    keys = Object.keys(tickDetails).sort((a, b) => b.length - a.length)
    sortedKeysCache.set(tickDetails, keys)
  }
  return keys
}

export function calculateTicksAndPoints(
  trade: Pick<Trade, 'instrument' | 'pnl' | 'quantity'>,
  tickDetails: Record<string, TickDetails>
): TickCalculation {
  // Default values if no tick details found
  let tickValue = 1
  let tickSize = 0.01

  // Find matching ticker from tick details using cached sorted keys
  const matchingTicker = getSortedKeys(tickDetails)
    .find(ticker => trade.instrument.includes(ticker))

  if (matchingTicker) {
    const details = tickDetails[matchingTicker]
    tickValue = Number(details.tickValue)
    tickSize = Number(details.tickSize)
  }

  // Calculate PnL per contract
  const pnlPerContract = Number(trade.pnl) / Number(trade.quantity)

  // Calculate ticks (monetary value per tick)
  const ticks = Math.round(pnlPerContract / tickValue)

  // Calculate points from ticks to ensure consistency
  // For ES: 1 tick = 0.25 points, so points = ticks * tickSize
  const points = ticks * tickSize


  return {
    ticks: isNaN(ticks) ? 0 : ticks,
    points: isNaN(points) ? 0 : Math.round(points * 100) / 100, // Round to 2 decimal places
    tickValue,
    tickSize
  }
}

export function calculateTicksAndPointsForTrades(
  trades: Trade[],
  tickDetails: Record<string, TickDetails>
): Record<string, TickCalculation> {
  const calculations: Record<string, TickCalculation> = {}

  trades.forEach(trade => {
    calculations[trade.id] = calculateTicksAndPoints(trade, tickDetails)
  })

  return calculations
}

export function calculateTicksAndPointsForGroupedTrade(
  groupedTrade: any,
  tickDetails: Record<string, TickDetails>
): TickCalculation {
  // If it's a grouped trade with multiple trades, sum them up
  if (groupedTrade.trades && groupedTrade.trades.length > 0) {
    let totalTicks = 0
    let totalPoints = 0

    groupedTrade.trades.forEach((trade: Trade) => {
      const calculation = calculateTicksAndPoints(trade, tickDetails)
      totalTicks += calculation.ticks
      totalPoints += calculation.points
    })

    return {
      ticks: totalTicks,
      points: Math.round(totalPoints * 100) / 100, // Round to 2 decimal places
      tickValue: 1, // Default for grouped trades
      tickSize: 0.01
    }
  }

  // If it's a single trade, calculate normally
  return calculateTicksAndPoints(groupedTrade, tickDetails)
} 
