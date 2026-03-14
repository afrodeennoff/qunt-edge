import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUserMock,
  getTeamByIdMock,
  getTeamAnalyticsMock,
  updateTeamAnalyticsMock,
  resolveTeamUserIdMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  getTeamByIdMock: vi.fn(),
  getTeamAnalyticsMock: vi.fn(),
  updateTeamAnalyticsMock: vi.fn(),
  resolveTeamUserIdMock: vi.fn(),
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}))

vi.mock("@/server/teams", () => ({
  getTeamById: getTeamByIdMock,
  getTeamAnalytics: getTeamAnalyticsMock,
  updateTeamAnalytics: updateTeamAnalyticsMock,
}))

vi.mock("@/server/team-membership", () => ({
  resolveTeamUserId: resolveTeamUserIdMock,
}))

describe("/api/teams/[id]/analytics error envelope", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: "auth-user-1" } } })
    resolveTeamUserIdMock.mockResolvedValue("db-user-1")
  })

  it("returns normalized unauthorized error for GET", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const { GET } = await import("@/app/api/teams/[id]/analytics/route")

    const response = await GET(new Request("http://localhost/api/teams/team-1/analytics"), {
      params: Promise.resolve({ id: "team-1" }),
    })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    })
  })

  it("returns normalized validation envelope for invalid period", async () => {
    const { GET } = await import("@/app/api/teams/[id]/analytics/route")

    const response = await GET(new Request("http://localhost/api/teams/team-1/analytics?period=yearly"), {
      params: Promise.resolve({ id: "team-1" }),
    })

    expect(response.status).toBe(400)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: {
        code: "VALIDATION_FAILED",
        message: "Invalid period",
        details: {
          requestId: expect.any(String),
        },
      },
    })
  })

  it("returns normalized not found envelope", async () => {
    getTeamByIdMock.mockResolvedValue(null)
    const { GET } = await import("@/app/api/teams/[id]/analytics/route")

    const response = await GET(new Request("http://localhost/api/teams/team-1/analytics"), {
      params: Promise.resolve({ id: "team-1" }),
    })

    expect(response.status).toBe(404)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: {
        code: "NOT_FOUND",
        message: "Team not found",
        details: {
          requestId: expect.any(String),
        },
      },
    })
  })

  it("returns normalized internal envelope for failed PUT update", async () => {
    updateTeamAnalyticsMock.mockResolvedValue({ success: false, error: "update failed" })
    const { PUT } = await import("@/app/api/teams/[id]/analytics/route")

    const response = await PUT(new Request("http://localhost/api/teams/team-1/analytics", { method: "PUT" }), {
      params: Promise.resolve({ id: "team-1" }),
    })

    expect(response.status).toBe(500)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: {
        code: "INTERNAL_ERROR",
        message: "update failed",
        details: {
          requestId: expect.any(String),
        },
      },
    })
  })
})
