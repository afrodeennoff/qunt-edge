import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teamAnalytics: {
      findFirst: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    trade: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/prisma"
import { getTeamAnalytics, updateTeamAnalytics } from "@/server/teams"

describe("getTeamAnalytics", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("returns an existing analytics record when it exists", async () => {
    const existing = { id: "a", teamId: "t_1", period: "daily" }
    vi.mocked(prisma.teamAnalytics.findFirst).mockResolvedValue(existing as never)

    const result = await getTeamAnalytics("t_1", "daily")

    expect(result).toBe(existing)
    expect(prisma.teamAnalytics.create).not.toHaveBeenCalled()
  })

  it("creates and returns a stub when analytics are missing", async () => {
    vi.mocked(prisma.teamAnalytics.findFirst).mockResolvedValue(null)
    const created = { id: "b", teamId: "t_1", period: "weekly" }
    vi.mocked(prisma.teamAnalytics.create).mockResolvedValue(created as never)

    const result = await getTeamAnalytics("t_1", "weekly")

    expect(prisma.teamAnalytics.create).toHaveBeenCalledWith({
      data: {
        teamId: "t_1",
        period: "weekly",
        totalPnl: 0,
        totalTrades: 0,
        winRate: 0,
        averageRr: 0,
      },
    })
    expect(result).toBe(created)
  })
})

describe("updateTeamAnalytics", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("upserts analytics for the requested period", async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue({ id: "m_1", role: "ADMIN" } as never)
    vi.mocked(prisma.teamMember.findMany).mockResolvedValue([{ userId: "u_1" }, { userId: "u_2" }] as never)
    vi.mocked(prisma.trade.aggregate).mockResolvedValue({ _sum: { pnl: 100 }, _count: { id: 2 } } as never)
    vi.mocked(prisma.trade.groupBy).mockResolvedValue([{ userId: "u_1", _sum: { pnl: 80 } }] as never)
    vi.mocked(prisma.trade.count).mockResolvedValue(1 as never)
    const upsertResult = { teamId: "team-1", period: "weekly", totalPnl: 100 }
    vi.mocked(prisma.teamAnalytics.upsert).mockResolvedValue(upsertResult as never)

    const result = await updateTeamAnalytics("team-1", "u_1", "weekly")

    expect(result.success).toBe(true)
    expect(result.analytics).toBe(upsertResult)
    expect(prisma.teamAnalytics.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId_period: { teamId: "team-1", period: "weekly" } },
        create: expect.objectContaining({ teamId: "team-1", period: "weekly" }),
      })
    )
  })
})
