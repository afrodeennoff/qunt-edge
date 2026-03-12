import { beforeEach, describe, expect, it, vi } from "vitest"

const { guardAiRequestMock } = vi.hoisted(() => ({
  guardAiRequestMock: vi.fn(),
}))

vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: guardAiRequestMock,
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => vi.fn(async () => ({
    success: true,
    limit: 30,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  }))),
}))

vi.mock("@/lib/ai/policy", () => ({
  getAiPolicy: vi.fn(() => ({
    feature: "analysis",
    provider: "openai",
    model: "gpt-4.1-mini",
    temperature: 0.2,
    maxSteps: 6,
    logSampleRate: 1,
  })),
}))

describe("/api/ai/search/date entitlement guard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    guardAiRequestMock.mockResolvedValue({
      ok: false,
      response: new Response("forbidden", { status: 403 }),
    })
  })

  it("uses search entitlement key in route guard", async () => {
    const { POST } = await import("@/app/api/ai/search/date/route")

    const response = await POST(
      new Request("http://localhost/api/ai/search/date", {
        method: "POST",
        body: JSON.stringify({ query: "last week" }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    )

    expect(response.status).toBe(403)
    expect(guardAiRequestMock).toHaveBeenCalledTimes(1)
    expect(guardAiRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      "search",
      expect.any(Function),
    )
  })
})
