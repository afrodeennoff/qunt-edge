import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: vi.fn(),
}))

vi.mock("@/server/teams", () => ({
  getTeamById: vi.fn(),
  getTeamAnalytics: vi.fn(),
  updateTeamAnalytics: vi.fn(),
}))

vi.mock("@/server/team-membership", () => ({
  resolveTeamUserId: vi.fn(async (authUserId: string) => authUserId),
}))

import { createRouteClient } from "@/lib/supabase/route-client"
import { getTeamAnalytics, getTeamById, updateTeamAnalytics } from "@/server/teams"
import { GET, PUT } from "@/app/api/teams/[id]/analytics/route"

describe("teams analytics route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 404 when team lookup throws Team not found", async () => {
    vi.mocked(createRouteClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u_1" } } }),
      },
    } as never)
    vi.mocked(getTeamById).mockRejectedValue(new Error("Team not found"))

    const response = await GET(
      new Request("http://localhost/api/teams/t_1/analytics"),
      { params: Promise.resolve({ id: "t_1" }) } as never
    )

    expect(response.status).toBe(404)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: {
        code: "NOT_FOUND",
        message: "Team not found",
      },
    })
  })

  it("returns normalized validation error when period is invalid", async () => {
    vi.mocked(createRouteClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u_1" } } }),
      },
    } as never)

    const response = await GET(
      new Request("http://localhost/api/teams/t_1/analytics?period=yearly"),
      { params: Promise.resolve({ id: "t_1" }) } as never
    )

    expect(response.status).toBe(400)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: {
        code: "VALIDATION_FAILED",
        message: "Invalid period",
      },
    })
  })

  it("returns 200 for valid team analytics response", async () => {
    vi.mocked(createRouteClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u_1" } } }),
      },
    } as never)
    vi.mocked(getTeamById).mockResolvedValue({ id: "t_1" } as never)
    vi.mocked(getTeamAnalytics).mockResolvedValue({ teamId: "t_1", totalPnl: 1 } as never)

    const response = await GET(
      new Request("http://localhost/api/teams/t_1/analytics?period=monthly"),
      { params: Promise.resolve({ id: "t_1" }) } as never
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.teamId).toBe("t_1")
  })

  it("passes period queries through when updating analytics", async () => {
    vi.mocked(createRouteClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u_1" } } }),
      },
    } as never)
    vi.mocked(getTeamById).mockResolvedValue({ id: "t_1" } as never)
    vi.mocked(updateTeamAnalytics).mockResolvedValue({ success: true, analytics: { teamId: "t_1" } } as never)

    const response = await PUT(
      new Request("http://localhost/api/teams/t_1/analytics?period=weekly"),
      { params: Promise.resolve({ id: "t_1" }) } as never
    )

    expect(response.status).toBe(200)
    expect(vi.mocked(updateTeamAnalytics)).toHaveBeenCalledWith("t_1", "u_1", "weekly")
  })
})
