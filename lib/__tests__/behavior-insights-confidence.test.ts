import { describe, expect, it } from "vitest";
import { computeBehaviorInsights } from "@/lib/behavior-insights";

function makeTrade(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: "t1",
    accountNumber: "ACC-1",
    userId: "u1",
    instrument: "ES",
    side: "long",
    quantity: 1,
    entryPrice: 100,
    closePrice: 101,
    pnl: 100,
    commission: 2,
    entryId: "e1",
    closeId: "c1",
    entryDate: now.toISOString(),
    closeDate: now.toISOString(),
    timeInPosition: 300,
    comment: "",
    tags: [],
    groupId: "",
    imageBase64: null,
    imageBase64Second: null,
    images: [],
    videoUrl: null,
    createdAt: now,
    ...overrides,
  } as any;
}

function makeMood(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: "m1",
    userId: "u1",
    day: now,
    mood: "good",
    journalContent: null,
    emotionalState: null,
    tradingPerformance: null,
    confidenceLevel: null,
    stressLevel: null,
    marketConditions: null,
    lessonsLearned: null,
    tomorrowFocus: null,
    emotionValue: 70,
    createdAt: now,
    ...overrides,
  } as any;
}

describe("computeBehaviorInsights confidence", () => {
  it("returns low confidence for sparse signals", () => {
    const insights = computeBehaviorInsights([makeTrade()], [], 30);

    expect(insights.summary.confidenceBand).toBe("low");
    expect(insights.summary.confidenceScore).toBeLessThan(45);
    expect(insights.drivers.length).toBeGreaterThan(0);
  });

  it("returns medium/high confidence for richer datasets", () => {
    const trades = Array.from({ length: 16 }).map((_, index) =>
      makeTrade({
        id: `t-${index}`,
        pnl: index % 3 === 0 ? -20 : 60,
        commission: 1,
        quantity: index % 4 === 0 ? 2 : 1,
        entryDate: new Date(Date.now() - index * 86400000).toISOString(),
      }),
    );

    const moods = Array.from({ length: 10 }).map((_, index) =>
      makeMood({
        id: `m-${index}`,
        day: new Date(Date.now() - index * 86400000),
        emotionValue: 55 + (index % 5),
      }),
    );

    const insights = computeBehaviorInsights(trades, moods, 30);

    expect(["medium", "high"]).toContain(insights.summary.confidenceBand);
    expect(insights.summary.confidenceScore).toBeGreaterThanOrEqual(45);
    expect(insights.recommendationsDetailed.length).toBeGreaterThan(0);
  });
});
