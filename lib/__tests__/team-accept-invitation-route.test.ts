import { beforeEach, describe, expect, it, vi } from "vitest"

const findUniqueMock = vi.fn()
const transactionMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teamInvitation: {
      findUnique: findUniqueMock,
    },
    $transaction: transactionMock,
  },
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: vi.fn(),
}))

vi.mock("@/server/team-membership", () => ({
  resolveTeamUserId: vi.fn().mockResolvedValue("db_user_1"),
  ensureTeamMembership: vi.fn().mockResolvedValue(undefined),
}))

import { createRouteClient } from "@/lib/supabase/route-client"
import { POST } from "@/app/api/team/accept-invitation/route"

describe("team accept invitation route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(createRouteClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    const response = await POST(
      new Request("http://localhost/api/team/accept-invitation", {
        method: "POST",
        body: JSON.stringify({ invitationId: "inv_1" }),
      })
    )

    expect(response.status).toBe(401)
  })

  it("accepts invitation in a transaction and returns 200", async () => {
    vi.mocked(createRouteClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "auth_1", email: "a@b.com" } } }),
      },
    } as never)

    findUniqueMock.mockResolvedValue({
      id: "inv_1",
      teamId: "team_1",
      email: "a@b.com",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 60_000),
      role: "TRADER",
      team: { id: "team_1" },
    })

    transactionMock.mockImplementation(async (fn: (tx: any) => Promise<void>) => {
      await fn({
        teamInvitation: {
          update: vi.fn().mockResolvedValue({}),
        },
      })
    })

    const response = await POST(
      new Request("http://localhost/api/team/accept-invitation", {
        method: "POST",
        body: JSON.stringify({ invitationId: "inv_1" }),
      })
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.teamId).toBe("team_1")
  })
})
