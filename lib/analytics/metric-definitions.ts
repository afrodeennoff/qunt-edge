export const ANALYTICS_METRIC_VERSION = 'v1'

export type AnalyticsMetricVersion = typeof ANALYTICS_METRIC_VERSION

export const ANALYTICS_METRIC_DEFINITIONS = {
  version: ANALYTICS_METRIC_VERSION,
  formulas: {
    winRate: 'wins / totalTrades',
    expectancy: '(avgWin * winRate) - (avgLoss * lossRate)',
    maxDrawdown: 'max(peakCumulativePnL - runningCumulativePnL)',
    streaks: 'consecutive winning/losing net trades',
    realizedVsUnrealized: 'realized = closed trades; unrealized = open positions (n/a in current model)',
  },
} as const

