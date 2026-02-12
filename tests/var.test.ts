import { describe, expect, it } from "vitest"
import {
  buildDailyReturnsFromTrades,
  computeHistoricalVar,
  computeParametricVar,
  computeVarSummary,
} from "@/lib/analytics/var"

describe("var analytics", () => {
  it("computes historical VaR at the expected percentile", () => {
    const returns = [-0.10, -0.08, -0.05, -0.02, 0, 0.01, 0.02]
    const var95 = computeHistoricalVar(returns, 0.95)
    expect(var95).toBeCloseTo(0.10, 10)
  })

  it("computes parametric VaR from mean and volatility", () => {
    const returns = [-0.01, 0.01]
    const var95 = computeParametricVar(returns, 0.95)
    expect(var95).toBeCloseTo(0.0164485, 5)
  })

  it("never returns a negative VaR", () => {
    const returns = [0.01, 0.015, 0.02, 0.03]
    expect(computeHistoricalVar(returns, 0.95)).toBeGreaterThanOrEqual(0)
    expect(computeParametricVar(returns, 0.99)).toBeGreaterThanOrEqual(0)
  })

  it("returns insufficientData when daily sample is below 30", () => {
    const trades = Array.from({ length: 10 }, (_, idx) => ({
      entryDate: new Date(Date.UTC(2026, 0, idx + 1)),
      pnl: 50,
      commission: 5,
    }))

    const result = computeVarSummary(trades, 10000)
    expect(result.insufficientData).toBe(true)
    expect(result.summary).toBeNull()
    expect(result.sampleSize).toBe(10)
  })

  it("builds stable daily returns and resolves portfolio value", () => {
    const trades = Array.from({ length: 35 }, (_, idx) => ({
      entryDate: new Date(Date.UTC(2026, 0, idx + 1)),
      pnl: idx % 2 === 0 ? 120 : -80,
      commission: 10,
    }))

    const { dailyReturns, portfolioValue } = buildDailyReturnsFromTrades(trades, 50000)
    expect(dailyReturns).toHaveLength(35)
    expect(portfolioValue).toBe(50000)
  })
})

