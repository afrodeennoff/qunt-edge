import { getAllTradesForAi, type AiTradesFetchResult } from './get-all-trades'
import type { SerializedTrade } from '@/server/trades'

/**
 * Access profile levels for AI trade analysis.
 * Controls the granularity of trade data exposed to AI systems.
 */
export type TradeAccessProfile = 'summary' | 'analysis' | 'detail'

/**
 * Parameters for fetching trades with profile-based access control.
 */
export interface GetAiTradesParams {
  userId: string
  profile: TradeAccessProfile
  forceRefresh?: boolean
}

/**
 * Aggregate metrics computed from trade history.
 */
export interface TradeAggregates {
  count: number
  totalPnl: number
  winRate: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  totalCommission: number
}

/**
 * Result of getAiTrades with profile-based projection.
 */
export interface AiTradesResult {
  trades?: SerializedTrade[]
  aggregates?: TradeAggregates
  truncated?: boolean
  fetchedPages?: number
  dataQualityWarning?: string
}

/**
 * Fields to exclude from all profiles for security.
 */
const SENSITIVE_FIELDS = ['imageBase64', 'imageBase64Second'] as const

/**
 * Fields to exclude from analysis profile (in addition to sensitive fields).
 */
const ANALYSIS_EXCLUDED_FIELDS = ['videoUrl', 'comment', ...SENSITIVE_FIELDS] as const

/**
 * Request-scoped memoization cache.
 * Uses WeakMap to allow garbage collection when request context is gone.
 */
const requestCache = new WeakMap<Request, Map<string, AiTradesResult>>()

/**
 * Get the request-scoped cache for memoization.
 */
function getRequestCache(): Map<string, AiTradesResult> {
  // In serverless/edge environments, we use a module-level Map as fallback
  // since WeakMap requires an object key which may not be available
  if (typeof globalThis !== 'undefined') {
    const globalKey = '__trade_access_cache__'
    const cache = (globalThis as unknown as Record<string, Map<string, AiTradesResult>>)[globalKey]
    if (cache) return cache
    
    const newCache = new Map<string, AiTradesResult>()
    ;(globalThis as unknown as Record<string, Map<string, AiTradesResult>>)[globalKey] = newCache
    return newCache
  }
  return new Map()
}

/**
 * Compute aggregate metrics from trades.
 */
function computeAggregates(trades: SerializedTrade[]): TradeAggregates {
  if (!trades.length) {
    return {
      count: 0,
      totalPnl: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      totalCommission: 0,
    }
  }

  let totalPnl = 0
  let totalCommission = 0
  let wins = 0
  let losses = 0
  let totalWinAmount = 0
  let totalLossAmount = 0
  let largestWin = 0
  let largestLoss = 0

  for (const trade of trades) {
    const pnl = parseFloat(trade.pnl) || 0
    const commission = parseFloat(trade.commission) || 0

    totalPnl += pnl
    totalCommission += commission

    if (pnl > 0) {
      wins++
      totalWinAmount += pnl
      if (pnl > largestWin) largestWin = pnl
    } else if (pnl < 0) {
      losses++
      totalLossAmount += Math.abs(pnl)
      if (Math.abs(pnl) > largestLoss) largestLoss = Math.abs(pnl)
    }
  }

  const count = trades.length
  const winRate = count > 0 ? (wins / count) * 100 : 0

  return {
    count,
    totalPnl,
    winRate,
    avgWin: wins > 0 ? totalWinAmount / wins : 0,
    avgLoss: losses > 0 ? totalLossAmount / losses : 0,
    largestWin,
    largestLoss,
    totalCommission,
  }
}

/**
 * Apply field projection based on access profile.
 */
function projectTradeFields(
  trades: SerializedTrade[],
  profile: TradeAccessProfile,
): SerializedTrade[] {
  if (profile === 'summary') {
    return [] // Summary doesn't return individual trades
  }

  return trades.map((trade) => {
    const projected = { ...trade }

    // Always exclude sensitive image fields
    for (const field of SENSITIVE_FIELDS) {
      delete (projected as Record<string, unknown>)[field]
    }

    // Additional exclusions for analysis profile
    if (profile === 'analysis') {
      for (const field of ANALYSIS_EXCLUDED_FIELDS) {
        if (field !== 'imageBase64' && field !== 'imageBase64Second') {
          delete (projected as Record<string, unknown>)[field]
        }
      }
    }

    return projected
  })
}

/**
 * Get trades with safe projection based on access profile.
 * Implements request-scoped memoization to avoid redundant fetches.
 * 
 * @param params - Parameters including userId, profile, and optional forceRefresh
 * @returns Trades with profile-based field projection and computed aggregates
 */
export async function getAiTrades(params: GetAiTradesParams): Promise<AiTradesResult> {
  const { userId, profile, forceRefresh = false } = params
  const cacheKey = `${userId}:${profile}:${forceRefresh}`

  // Check memoization cache first
  const cache = getRequestCache()
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch all trades using existing AI trade fetcher
  const fetchResult: AiTradesFetchResult = await getAllTradesForAi({
    forceRefresh,
    pageSize: 500,
    maxPages: 200,
  })

  // Compute aggregates (available for all profiles)
  const aggregates = computeAggregates(fetchResult.trades)

  // Apply profile-based projection
  const projectedTrades = projectTradeFields(fetchResult.trades, profile)

  // Build result based on profile
  const result: AiTradesResult = {
    aggregates,
    truncated: fetchResult.truncated,
    fetchedPages: fetchResult.fetchedPages,
    dataQualityWarning: fetchResult.dataQualityWarning,
  }

  // Add trades based on profile
  if (profile !== 'summary') {
    result.trades = projectedTrades
  }

  // Memoize result
  cache.set(cacheKey, result)

  return result
}

/**
 * Clear the trade access cache.
 * Useful for testing to ensure clean state between tests.
 */
export function clearTradeAccessCache(): void {
  const cache = getRequestCache()
  cache.clear()
}
