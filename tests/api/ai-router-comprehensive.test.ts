import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  streamTextMock,
  convertToModelMessagesMock,
  createCompletionWithRouterMock,
  logAiRequestMock,
} = vi.hoisted(() => ({
  streamTextMock: vi.fn(),
  convertToModelMessagesMock: vi.fn(),
  createCompletionWithRouterMock: vi.fn(),
  logAiRequestMock: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: (arg: unknown) => streamTextMock(arg),
  convertToModelMessages: (arg: unknown) => convertToModelMessagesMock(arg),
  stepCountIs: vi.fn(() => () => false),
  tool: vi.fn((definition: unknown) => definition),
  createTool: vi.fn((definition: unknown) => definition),
}));

vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: vi.fn(async () => ({
    ok: true,
    userId: "test-user-1",
    email: "test@example.com",
  })),
}));

vi.mock("@/lib/ai/client", () => ({
  getAiLanguageModel: vi.fn(() => "direct-model"),
  getAiLanguageModelById: vi.fn(() => "direct-model"),
  createCompletionWithRouter: (...args: unknown[]) => createCompletionWithRouterMock(...args),
}));

vi.mock("@/lib/ai/telemetry", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/telemetry")>("@/lib/ai/telemetry");
  return {
    ...actual,
    logAiRequest: (...args: unknown[]) => logAiRequestMock(...args),
  };
});

vi.mock("openai", () => ({
  default: class MockOpenAI {
    public audio = {
      transcriptions: {
        create: vi.fn(async () => "mock transcript"),
      },
    };
  },
}));

describe("AI Router - Comprehensive Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.AI_ROUTER_ENABLED = "false";

    convertToModelMessagesMock.mockResolvedValue([{ role: "user", content: "hello" }]);
    streamTextMock.mockReturnValue({
      toUIMessageStreamResponse: vi.fn(() => new Response("ok", { status: 200 })),
    });
  });

  it("support route uses direct streaming when router is disabled", async () => {
    const { POST } = await import("@/app/api/ai/support/route");
    const response = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Help me" }] }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalled();
    expect(createCompletionWithRouterMock).not.toHaveBeenCalled();
  });

  it("support route runs router path without OPENAI_API_KEY", async () => {
    delete process.env.OPENAI_API_KEY;

    const { POST } = await import("@/app/api/ai/support/route");
    const response = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Help me" }] }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalled();
    expect(createCompletionWithRouterMock).not.toHaveBeenCalled();
  });

  it("support route falls back to direct path when router attempt fails", async () => {
    const { POST } = await import("@/app/api/ai/support/route");
    const response = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Help me" }] }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalled();
    expect(createCompletionWithRouterMock).not.toHaveBeenCalled();
  });

  it("transcribe route records telemetry on success", async () => {
    const { POST } = await import("@/app/api/ai/transcribe/route");
    const formData = new FormData();
    formData.append("audio", new File(["audio"], "test.mp3", { type: "audio/mp3" }));

    const response = await POST(
      new Request("http://localhost/api/ai/transcribe", {
        method: "POST",
        body: formData,
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(logAiRequestMock).toHaveBeenCalled();
  });

});
