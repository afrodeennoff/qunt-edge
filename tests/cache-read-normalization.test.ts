import { describe, expect, it } from "vitest"

import { normalizeTradesForClient, type SerializedTrade } from "@/lib/data-types"

describe("cache trade normalization", () => {
  it("normalizes serialized cached trades into finite client numeric fields", () => {
    const serializedTrades: SerializedTrade[] = [
      ({
        id: "trade-1",
        userId: "user-1",
        accountId: "acct-1",
        accountNumber: "ACC-1",
        instrument: "MES",
        side: "LONG",
        entryPrice: "100.5",
        closePrice: "101.5",
        pnl: "50.25",
        commission: "2.25",
        quantity: "1",
        timeInPosition: "1800",
        entryDate: "2025-01-01T10:00:00.000Z",
        closeDate: "2025-01-01T10:30:00.000Z",
        createdAt: new Date("2025-01-01T10:31:00.000Z"),
        updatedAt: new Date("2025-01-01T10:31:00.000Z"),
        tagNames: [],
      } as unknown as SerializedTrade),
    ]

    const normalized = normalizeTradesForClient(serializedTrades)

    expect(normalized).toHaveLength(1)
    expect(typeof normalized[0].pnl).toBe("number")
    expect(typeof normalized[0].commission).toBe("number")
    expect(typeof normalized[0].quantity).toBe("number")
    expect(Number.isFinite(normalized[0].pnl)).toBe(true)
    expect(Number.isFinite(normalized[0].commission ?? 0)).toBe(true)
    expect(Number.isFinite(normalized[0].quantity)).toBe(true)
  })
})
