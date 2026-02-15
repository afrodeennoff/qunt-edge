import { describe, expect, it } from "vitest"

import { hasFiniteKeyPrefix, hasPositiveFiniteByKey } from "@/lib/chart-guards"

describe("chart has-data guards", () => {
  it("detects positive finite values by key", () => {
    const rows = [
      { count: 0 },
      { count: Number.NaN },
      { count: "5" },
    ]

    expect(hasPositiveFiniteByKey(rows, "count")).toBe(true)
  })

  it("returns false when key values are non-finite or non-positive", () => {
    const rows = [{ count: 0 }, { count: -1 }, { count: "abc" }]

    expect(hasPositiveFiniteByKey(rows, "count")).toBe(false)
  })

  it("detects finite values with a key prefix", () => {
    const rows = [
      { equity_a: "abc" },
      { equity_b: 0 },
      { another: 10 },
    ]

    expect(hasFiniteKeyPrefix(rows, "equity_")).toBe(true)
  })

  it("returns false when prefixed keys are never finite", () => {
    const rows = [{ equity_a: "abc" }, { equity_b: Number.NaN }]

    expect(hasFiniteKeyPrefix(rows, "equity_")).toBe(false)
  })
})
