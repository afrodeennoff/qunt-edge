# Analytics Metric Definitions

## Versioning

- Current metric version: `v1`
- Source of truth: `lib/analytics/metric-definitions.ts`
- Runtime implementation: `lib/analytics/metrics-v1.ts`

## Formulas (v1)

- `winRate = wins / totalTrades`
- `expectancy = (avgWin * winRate) - (avgLoss * lossRate)`
- `maxDrawdown = max(peakCumulativePnL - runningCumulativePnL)`
- `streaks = max consecutive winning/losing net trades`
- `realizedPnl = sum(netPnl(closed trades))`
- `unrealizedPnl = 0` (no open-position model in current dataset)

## Notes

- Net trade result is `pnl - commission` and uses decimal-safe arithmetic via `lib/financial-math.ts`.
- Historical reproducibility relies on metric version pinning in code and tests.
- Any formula adjustment must ship as a new metric version (`v2`, `v3`, ...), not an in-place edit.

