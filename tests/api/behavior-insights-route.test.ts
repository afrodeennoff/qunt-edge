import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { getDatabaseUserId, getRedisJson, tradeFindMany, moodFindMany } = vi.hoisted(() => ({
  getDatabaseUserId: vi.fn(),
  getRedisJson: vi.fn(),
  tradeFindMany: vi.fn(),
  moodFindMany: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getDatabaseUserId,
}))

vi.mock("@/lib/redis-cache", () => ({
  getRedisJson,
  setRedisJson: vi.fn(),
}))

vi.mock("@/lib/behavior-insights", () => ({
  computeBehaviorInsights: vi.fn(() => ({ summary: { tradeCount: 0 } })),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    trade: {
      findMany: tradeFindMany,
    },
    mood: {
      findMany: moodFindMany,
    },
  },
}))

import { GET } from "@/app/api/behavior/insights/route"

describe("/api/behavior/insights error envelope", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRedisJson.mockResolvedValue(null)
    tradeFindMany.mockResolvedValue([])
    moodFindMany.mockResolvedValue([])
  })

  it("returns normalized unauthorized error", async () => {
    getDatabaseUserId.mockResolvedValue(null)

    const response = await GET(new NextRequest("http://localhost/api/behavior/insights"))

    expect(response.status).toBe(401)
    const payload = await response.json()
    expect(payload).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    })
  })

  it("returns normalized internal error when query fails", async () => {
    getDatabaseUserId.mockResolvedValue("user_1")
    tradeFindMany.mockRejectedValue(new Error("db failed"))

    const response = await GET(new NextRequest("http://localhost/api/behavior/insights"))

    expect(response.status).toBe(500)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to build behavior insights",
      },
    })
    expect(payload.error.details).toMatchObject({
      requestId: expect.any(String),
    })
  })
})
