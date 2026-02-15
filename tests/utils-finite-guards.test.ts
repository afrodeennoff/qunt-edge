import { describe, expect, it } from "vitest"

import { calculateStatistics, formatCalendarData, safeDivide, toFiniteNumber } from "@/lib/utils"

describe("numeric guard helpers", () => {
  it("coerces finite numbers and applies fallback for invalid values", () => {
    expect(toFiniteNumber("12.5")).toBe(12.5)
    expect(toFiniteNumber("invalid", 7)).toBe(7)
    expect(toFiniteNumber(Number.NaN, 3)).toBe(3)
  })

  it("divides safely and returns fallback for invalid division", () => {
    expect(safeDivide(10, 2)).toBe(5)
    expect(safeDivide(10, 0, 99)).toBe(99)
    expect(safeDivide(Number.NaN, 2, 11)).toBe(11)
  })
})

describe("statistics and calendar guards", () => {
  const baseTrade = {
    id: "trade-1",
    accountNumber: "ACC-1",
    entryDate: new Date("2025-01-01T10:00:00Z"),
    closeDate: new Date("2025-01-01T11:00:00Z"),
    side: "long",
    instrument: "MES",
    pnl: 100,
    commission: 10,
    timeInPosition: 3600,
    quantity: 1,
  }

  it("keeps calculateStatistics finite when trades include malformed numeric values", () => {
    const trades = [
      baseTrade,
      {
        ...baseTrade,
        id: "trade-2",
        pnl: "abc",
        commission: "-",
        timeInPosition: null,
      },
    ] as any

    const accounts = [
      {
        number: "ACC-1",
        payouts: [{ amount: "bad", date: new Date("2025-01-02T00:00:00Z") }],
      },
    ] as any

    const stats = calculateStatistics(trades, accounts)

    expect(Number.isFinite(stats.cumulativePnl)).toBe(true)
    expect(Number.isFinite(stats.cumulativeFees)).toBe(true)
    expect(Number.isFinite(stats.winRate)).toBe(true)
    expect(Number.isFinite(stats.totalPositionTime)).toBe(true)
    expect(Number.isFinite(stats.totalPayouts)).toBe(true)
  })

  it("skips invalid dates and keeps calendar pnl finite", () => {
    const trades = [
      {
        ...baseTrade,
        id: "trade-3",
        entryDate: "invalid-date",
      },
      {
        ...baseTrade,
        id: "trade-4",
        pnl: "50",
        commission: "5",
      },
    ] as any

    const calendar = formatCalendarData(trades, [])
    const keys = Object.keys(calendar)

    expect(keys.length).toBe(1)
    expect(Number.isFinite(calendar[keys[0]].pnl)).toBe(true)
  })
})
