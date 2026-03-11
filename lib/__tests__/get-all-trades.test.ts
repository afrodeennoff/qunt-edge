import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllTradesForAi } from "@/lib/ai/get-all-trades";
import type { PaginatedTrades } from "@/server/database";

const getTradesActionMock = vi.fn();
const getUserIdMock = vi.fn();
const getRedisJsonMock = vi.fn();
const setRedisJsonMock = vi.fn();

vi.mock("@/server/database", () => ({
  getTradesAction: (...args: unknown[]) => getTradesActionMock(...args),
}));

vi.mock("@/server/auth", () => ({
  getUserId: () => getUserIdMock(),
}));

vi.mock("@/lib/redis-cache", () => ({
  getRedisJson: (...args: unknown[]) => getRedisJsonMock(...args),
  setRedisJson: (...args: unknown[]) => setRedisJsonMock(...args),
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
      } as unknown as PaginatedTrades["trades"][number],
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
    getUserIdMock.mockReset();
    getRedisJsonMock.mockReset();
    setRedisJsonMock.mockReset();

    getUserIdMock.mockResolvedValue("u-1");
    getRedisJsonMock.mockResolvedValue(null);
    setRedisJsonMock.mockResolvedValue(undefined);
  });

  it("returns full data without truncation when pagination ends", async () => {
    getTradesActionMock.mockResolvedValueOnce(buildPage(1, 1, false));

    const result = await getAllTradesForAi({ pageSize: 100, maxPages: 5 });

    expect(result.trades).toHaveLength(1);
    expect(result.truncated).toBe(false);
    expect(result.fetchedPages).toBe(1);
    expect(result.dataQualityWarning).toBeUndefined();
    expect(getTradesActionMock).toHaveBeenCalledWith("u-1", 1, 100, false, false);
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
    expect(getTradesActionMock).toHaveBeenNthCalledWith(1, "u-1", 1, 100, false, false);
    expect(getTradesActionMock).toHaveBeenNthCalledWith(2, "u-1", 2, 100, false, false);
  });

  it("fails closed when authenticated user cannot be resolved", async () => {
    getUserIdMock.mockRejectedValueOnce(new Error("auth unavailable"));

    await expect(getAllTradesForAi({ pageSize: 100, maxPages: 1 })).rejects.toThrow(
      "auth unavailable",
    );
  });
});
