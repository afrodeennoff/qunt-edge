import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  createRouteClientMock,
  getUserMock,
  canAccessAiFeatureMock,
  assertWithinAiBudgetMock,
  limiterMock,
} = vi.hoisted(() => ({
  createRouteClientMock: vi.fn(),
  getUserMock: vi.fn(),
  canAccessAiFeatureMock: vi.fn(),
  assertWithinAiBudgetMock: vi.fn(),
  limiterMock: vi.fn(),
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: createRouteClientMock,
}))

vi.mock("@/lib/ai/entitlements", () => ({
  canAccessAiFeature: canAccessAiFeatureMock,
}))

vi.mock("@/lib/ai/usage-budget", () => ({
  assertWithinAiBudget: assertWithinAiBudgetMock,
}))

import { guardAiRequest } from "@/lib/ai/route-guard"

describe("guardAiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    createRouteClientMock.mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
    })

    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    })

    canAccessAiFeatureMock.mockResolvedValue({
      allowed: true,
      isActive: true,
      plan: "Plus",
    })

    limiterMock.mockResolvedValue({
      success: true,
      limit: 30,
      remaining: 29,
      resetTime: Date.now() + 60_000,
    })

    assertWithinAiBudgetMock.mockResolvedValue({
      allowed: true,
      limit: 2_000_000,
      used: 10_000,
      remaining: 1_990_000,
    })
  })

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null })

    const result = await guardAiRequest(
      new Request("http://localhost/api/ai/chat", { method: "POST" }),
      "chat",
      limiterMock,
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(401)
    }

    expect(canAccessAiFeatureMock).not.toHaveBeenCalled()
    expect(limiterMock).not.toHaveBeenCalled()
    expect(assertWithinAiBudgetMock).not.toHaveBeenCalled()
  })

  it("returns 403 when entitlement denies access", async () => {
    canAccessAiFeatureMock.mockResolvedValue({
      allowed: false,
      reason: "Subscription required",
      plan: "Free",
      isActive: false,
    })

    const result = await guardAiRequest(
      new Request("http://localhost/api/ai/chat", { method: "POST" }),
      "chat",
      limiterMock,
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(403)
    }

    expect(limiterMock).not.toHaveBeenCalled()
    expect(assertWithinAiBudgetMock).not.toHaveBeenCalled()
  })

  it("returns 429 when rate limited", async () => {
    limiterMock.mockResolvedValue({
      success: false,
      limit: 30,
      remaining: 0,
      resetTime: Date.now() + 30_000,
    })

    const req = new Request("http://localhost/api/ai/chat", { method: "POST" })
    const result = await guardAiRequest(req, "chat", limiterMock)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(429)
    }

    expect(limiterMock).toHaveBeenCalledWith(req, { subject: "user-1" })
    expect(assertWithinAiBudgetMock).not.toHaveBeenCalled()
  })

  it("returns 429 when over budget", async () => {
    assertWithinAiBudgetMock.mockResolvedValue({
      allowed: false,
      limit: 150_000,
      used: 160_000,
      remaining: 0,
    })

    const result = await guardAiRequest(
      new Request("http://localhost/api/ai/chat", { method: "POST" }),
      "chat",
      limiterMock,
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(429)
    }
  })

  it("returns ok with user context when all checks pass", async () => {
    const result = await guardAiRequest(
      new Request("http://localhost/api/ai/chat", { method: "POST" }),
      "chat",
      limiterMock,
    )

    expect(result).toEqual({
      ok: true,
      userId: "user-1",
      email: "user@example.com",
    })
    expect(assertWithinAiBudgetMock).toHaveBeenCalledWith("user-1", true)
  })
})
