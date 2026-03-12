import { beforeEach, describe, expect, it, vi } from "vitest"

const { getDatabaseUserId, findUnique } = vi.hoisted(() => ({
  getDatabaseUserId: vi.fn(),
  findUnique: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getDatabaseUserId,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    traderBenchmarkSnapshot: {
      findUnique,
      upsert: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

import { GET } from "@/app/api/trader-profile/benchmark/route"

describe("/api/trader-profile/benchmark auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when auth resolution throws", async () => {
    getDatabaseUserId.mockRejectedValue(new Error("auth lookup failed"))

    const response = await GET()

    expect(response.status).toBe(401)
    expect(findUnique).not.toHaveBeenCalled()
  })
})
