import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllTradesForAi } from "@/lib/ai/get-all-trades";
import type { PaginatedTrades } from "@/server/trades";

const getTradesActionMock = vi.fn<
  Promise<PaginatedTrades>,
  [string | null?, number?, number?, boolean?]
>();

vi.mock("@/server/database", () => ({
  getTradesAction: (...args: [string | null?, number?, number?, boolean?]) =>
    getTradesActionMock(...args),
}));

function buildPage(total: number, page: number, hasMore: boolean): PaginatedTrades {
  return {
    trades: [
      {
        id: `t-${page}`,
        accountNumber: "ACC-1",
        instrument: "ES",
        side: "long",
        quantity: "1",
        entryPrice: "5000",
        closePrice: "5010",
        pnl: "10",
        commission: "1",
        entryDate: "2026-01-01T00:00:00.000Z",
        closeDate: "2026-01-01T00:05:00.000Z",
        timeInPosition: "300",
        comment: null,
        tags: [],
        groupId: null,
        userId: "u-1",
        videoUrl: null,
      },
    ],
    metadata: {
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / 1)),
      hasMore,
    },
  };
}

describe("getAllTradesForAi", () => {
  beforeEach(() => {
    getTradesActionMock.mockReset();
  });

  it("returns full data without truncation when pagination ends", async () => {
    getTradesActionMock.mockResolvedValueOnce(buildPage(1, 1, false));

    const result = await getAllTradesForAi({ pageSize: 100, maxPages: 5 });

    expect(result.trades).toHaveLength(1);
    expect(result.truncated).toBe(false);
    expect(result.fetchedPages).toBe(1);
    expect(result.dataQualityWarning).toBeUndefined();
    expect(getTradesActionMock).toHaveBeenCalledWith(null, 1, 100);
  });

  it("marks result as truncated when max page cap is reached", async () => {
    getTradesActionMock
      .mockResolvedValueOnce(buildPage(1000, 1, true))
      .mockResolvedValueOnce(buildPage(1000, 2, true));

    const result = await getAllTradesForAi({ pageSize: 100, maxPages: 2 });

    expect(result.trades).toHaveLength(2);
    expect(result.truncated).toBe(true);
    expect(result.fetchedPages).toBe(2);
    expect(result.dataQualityWarning).toContain("capped subset");
    expect(getTradesActionMock).toHaveBeenNthCalledWith(1, null, 1, 100);
    expect(getTradesActionMock).toHaveBeenNthCalledWith(2, null, 2, 100);
  });
});
