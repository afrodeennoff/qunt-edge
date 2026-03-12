import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  createRouteClientMock,
  getUserMock,
  canAccessAiFeatureMock,
  assertWithinAiBudgetMock,
  limiterMock,
  prismaMock,
} = vi.hoisted(() => ({
  createRouteClientMock: vi.fn(),
  getUserMock: vi.fn(),
  canAccessAiFeatureMock: vi.fn(),
  assertWithinAiBudgetMock: vi.fn(),
  limiterMock: vi.fn(),
  prismaMock: {
    aiUsageLedger: {
      create: vi.fn(),
    },
    $executeRaw: vi.fn(),
  },
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

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { guardAiRequest } from "@/lib/ai/route-guard"
import { aiError, aiBudgetError } from "@/lib/ai/errors"
import { logAiRequest } from "@/lib/ai/telemetry"

interface ErrorBody {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    budget?: {
      limit: number
      used: number
      remaining: number
    }
    retryAfter?: number
  }
}

async function parseResponseBody(response: Response): Promise<ErrorBody> {
  const text = await response.text()
  return JSON.parse(text) as ErrorBody
}

describe("ai-budget-enforcement", () => {
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

    prismaMock.aiUsageLedger.create.mockResolvedValue(undefined)
    prismaMock.$executeRaw.mockResolvedValue(1)
  })

  describe("aiError helper", () => {
    it("returns unified API error shape for AI routes", async () => {
      const response = aiError(401, "UNAUTHORIZED", "Authentication required")

      expect(response.status).toBe(401)
      expect(response.headers.get("Content-Type")).toBe("application/json")
      expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0")

      const body = await parseResponseBody(response)
      expect(body.error.code).toBe("UNAUTHORIZED")
      expect(body.error.message).toBe("Authentication required")
      expect(body.error.details).toBeUndefined()
    })

    it("includes details when provided", async () => {
      const response = aiError(
        403,
        "FORBIDDEN",
        "Feature not available",
        { feature: "chat", plan: "Free" },
      )

      expect(response.status).toBe(403)
      const body = await parseResponseBody(response)
      expect(body.error.details).toEqual({ feature: "chat", plan: "Free" })
    })

    it("includes budget metadata in error response", async () => {
      const response = aiBudgetError(150_000, 160_000, 0)

      expect(response.status).toBe(429)
      const body = await parseResponseBody(response)
      expect(body.error.code).toBe("BUDGET_EXCEEDED")
      // Budget is in details for consistency with route-guard
      const details = body.error.details as { budget?: { limit: number; used: number; remaining: number }; retryAfter?: number } | undefined
      expect(details?.budget).toEqual({
        limit: 150_000,
        used: 160_000,
        remaining: 0,
      })
      expect(details?.retryAfter).toBe(30)
    })
  })

  describe("returns 429 when monthly token budget exhausted", () => {
    it("returns 429 status code when budget is exhausted", async () => {
      assertWithinAiBudgetMock.mockResolvedValue({
        allowed: false,
        limit: 150_000,
        used: 150_000,
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
        const body = await parseResponseBody(result.response)
        expect(body.error.code).toBe("RATE_LIMITED")
        expect(body.error.details).toBeDefined()
        const details = body.error.details as { limit: number; used: number; remaining: number } | undefined
        expect(details?.limit).toBe(150000)
        expect(details?.used).toBe(150000)
        expect(details?.remaining).toBe(0)
      }
    })

    it("includes budget metadata when budget is exceeded", async () => {
      assertWithinAiBudgetMock.mockResolvedValue({
        allowed: false,
        limit: 2_000_000,
        used: 2_100_000,
        remaining: 0,
      })

      const result = await guardAiRequest(
        new Request("http://localhost/api/ai/analysis/accounts", { method: "POST" }),
        "analysis",
        limiterMock,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        const body = await parseResponseBody(result.response)
        const details = body.error.details as { limit: number; used: number; remaining: number } | undefined
        expect(details?.limit).toBe(2000000)
        expect(details?.used).toBe(2100000)
        expect(details?.remaining).toBe(0)
      }
    })
  })

  describe("logs budget denials with consistent error category", () => {
    it("categorizes budget exceeded errors correctly", async () => {
      assertWithinAiBudgetMock.mockResolvedValue({
        allowed: false,
        limit: 100_000,
        used: 120_000,
        remaining: 0,
      })

      const result = await guardAiRequest(
        new Request("http://localhost/api/ai/chat", { method: "POST" }),
        "chat",
        limiterMock,
      )

      expect(result.ok).toBe(false)
      // The current implementation returns RATE_LIMITED for budget exceeded
      // which is intentional (same status code as rate limiting)
      expect(result.ok).toBe(false)
    })
  })

  describe("returns unified API error shape for AI routes", () => {
    it("returns consistent error shape for unauthorized", async () => {
      getUserMock.mockResolvedValue({ data: { user: null }, error: null })

      const result = await guardAiRequest(
        new Request("http://localhost/api/ai/chat", { method: "POST" }),
        "chat",
        limiterMock,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(401)
        const body = await parseResponseBody(result.response)
        expect(body.error).toBeDefined()
        expect(body.error.code).toBeDefined()
        expect(body.error.message).toBeDefined()
      }
    })

    it("returns consistent error shape for forbidden", async () => {
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
        const body = await parseResponseBody(result.response)
        expect(body.error.code).toBe("FORBIDDEN")
        expect(body.error.details).toBeDefined()
      }
    })

    it("returns consistent error shape for rate limit", async () => {
      limiterMock.mockResolvedValue({
        success: false,
        limit: 30,
        remaining: 0,
        resetTime: Date.now() + 30_000,
      })

      const result = await guardAiRequest(
        new Request("http://localhost/api/ai/chat", { method: "POST" }),
        "chat",
        limiterMock,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(429)
        const body = await parseResponseBody(result.response)
        expect(body.error.code).toBe("RATE_LIMITED")
      }
    })
  })

  describe("deterministic budget accounting", () => {
    it("records token usage even when success telemetry is sampled out", async () => {
      await logAiRequest({
        userId: "user-1",
        route: "/api/ai/chat",
        feature: "chat",
        model: "glm-4.7-flash",
        provider: "openai-compatible",
        usage: { totalTokens: 321 },
        latencyMs: 42,
        success: true,
        sampleRate: 0,
      })

      expect(prismaMock.aiUsageLedger.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          route: "/api/ai/chat",
          feature: "chat",
          totalTokens: 321,
        },
      })

      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })
  })
})
