import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: vi.fn(async () => ({ ok: true, userId: "user-1", email: "user@example.com" })),
}))

vi.mock("ai", () => ({
  generateObject: vi.fn(async () => ({ object: {}, usage: undefined })),
  generateText: vi.fn(async () => ({ output: {}, usage: undefined })),
  Output: { object: vi.fn(() => ({})) },
  streamText: vi.fn(() => ({
    toUIMessageStreamResponse: () => new Response("ok"),
    toTextStreamResponse: () => new Response("ok"),
  })),
  convertToModelMessages: vi.fn(async (messages: unknown) => messages),
  stepCountIs: vi.fn(() => () => false),
  tool: vi.fn((definition: unknown) => definition),
  createTool: vi.fn((definition: unknown) => definition),
}))

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}))

vi.mock("openai", () => ({
  default: class MockOpenAI {
    public audio = {
      transcriptions: {
        create: vi.fn(async () => "mock transcript"),
      },
    }
  },
}))

interface ErrorContractBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

async function parseError(response: Response): Promise<ErrorContractBody> {
  return (await response.json()) as ErrorContractBody
}

describe("AI route error contract consistency", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key"
  })

  afterEach(() => {
    vi.resetModules()
    process.env.OPENAI_API_KEY = originalOpenAiKey
  })

  it("returns normalized validation error for editor route", async () => {
    const { POST } = await import("@/app/api/ai/editor/route")
    const response = await POST(
      new Request("http://localhost/api/ai/editor", {
        method: "POST",
        body: JSON.stringify({ prompt: "test", action: "invalid-action" }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await parseError(response)
    expect(body.error.code).toBe("VALIDATION_FAILED")
    expect(body.error.message).toBe("Invalid request parameters")
    expect(body.error.details).toBeDefined()
  })

  it("returns normalized validation error for support route", async () => {
    const { POST } = await import("@/app/api/ai/support/route")
    const response = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await parseError(response)
    expect(body.error.code).toBe("VALIDATION_FAILED")
    expect(body.error.message).toBe("Invalid support request payload")
    expect(body.error.details).toBeDefined()
  })

  it("returns normalized validation error for transcribe route missing file", async () => {
    const { POST } = await import("@/app/api/ai/transcribe/route")
    const formData = new FormData()
    const response = await POST(
      new Request("http://localhost/api/ai/transcribe", {
        method: "POST",
        body: formData,
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await parseError(response)
    expect(body.error.code).toBe("VALIDATION_FAILED")
    expect(body.error.message).toBe("No audio file provided")
  })

  it("returns normalized validation error for analysis routes", async () => {
    const routes = [
      { modulePath: "@/app/api/ai/analysis/accounts/route", requestPath: "/api/ai/analysis/accounts" },
      { modulePath: "@/app/api/ai/analysis/global/route", requestPath: "/api/ai/analysis/global" },
      { modulePath: "@/app/api/ai/analysis/instrument/route", requestPath: "/api/ai/analysis/instrument" },
      { modulePath: "@/app/api/ai/analysis/time-of-day/route", requestPath: "/api/ai/analysis/time-of-day" },
    ] as const

    for (const route of routes) {
      const { POST } = await import(route.modulePath)
      const response = await POST(
        new Request(`http://localhost${route.requestPath}`, {
          method: "POST",
          body: JSON.stringify({ messages: [], locale: 123 }),
          headers: { "Content-Type": "application/json" },
        }) as never,
      )

      expect(response.status).toBe(400)
      const body = await parseError(response)
      expect(body.error.code).toBe("VALIDATION_FAILED")
      expect(body.error.message).toBe("Invalid analysis request payload")
      expect(body.error.details).toBeDefined()
    }
  })

  it("returns normalized validation error for mappings route", async () => {
    const { POST } = await import("@/app/api/ai/mappings/route")
    const response = await POST(
      new Request("http://localhost/api/ai/mappings", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await parseError(response)
    expect(body.error.code).toBe("VALIDATION_FAILED")
    expect(body.error.message).toBe("Invalid mappings request payload")
    expect(body.error.details).toBeDefined()
  })

  it("returns normalized validation error for search/date route", async () => {
    const { POST } = await import("@/app/api/ai/search/date/route")
    const response = await POST(
      new Request("http://localhost/api/ai/search/date", {
        method: "POST",
        body: JSON.stringify({ query: 123 }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await parseError(response)
    expect(body.error.code).toBe("VALIDATION_FAILED")
    expect(body.error.message).toBe("Invalid date-search payload")
    expect(body.error.details).toBeDefined()
  })
})
