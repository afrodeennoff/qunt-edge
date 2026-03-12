import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  streamTextMock,
  convertToModelMessagesMock,
  createCompletionWithRouterMock,
  getRouterConfigMock,
  createUIMessageStreamMock,
  createUIMessageStreamResponseMock,
  logAiRequestMock,
} = vi.hoisted(() => ({
  streamTextMock: vi.fn(),
  convertToModelMessagesMock: vi.fn(),
  createCompletionWithRouterMock: vi.fn(),
  getRouterConfigMock: vi.fn(),
  createUIMessageStreamMock: vi.fn((...args: unknown[]) => {
    void args;
    return "stream";
  }),
  createUIMessageStreamResponseMock: vi.fn((...args: unknown[]) => {
    void args;
    return new Response("router-ok", { status: 200 });
  }),
  logAiRequestMock: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: (arg: unknown) => streamTextMock(arg),
  convertToModelMessages: (arg: unknown) => convertToModelMessagesMock(arg),
  createUIMessageStream: (arg: unknown) => createUIMessageStreamMock(arg),
  createUIMessageStreamResponse: (arg: unknown) => createUIMessageStreamResponseMock(arg),
  tool: (definition: unknown) => definition,
}));

vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: vi.fn(async () => ({ ok: true, userId: "u_1", email: "u@example.com" })),
}));

vi.mock("@/lib/ai/client", () => ({
  getAiLanguageModel: vi.fn(() => "model"),
  getAiLanguageModelById: vi.fn(() => "model"),
  createCompletionWithRouter: (...args: unknown[]) => createCompletionWithRouterMock(...args),
}));

vi.mock("@/lib/ai/router/config", () => ({
  getRouterConfig: () => getRouterConfigMock(),
}));

vi.mock("@/lib/ai/telemetry", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/telemetry")>("@/lib/ai/telemetry");
  return {
    ...actual,
    logAiRequest: (...args: unknown[]) => logAiRequestMock(...args),
  };
});

import { POST } from "@/app/api/ai/support/route";

describe("ai support route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    convertToModelMessagesMock.mockResolvedValue([{ role: "user", content: "hello" }]);
    getRouterConfigMock.mockReturnValue({ enabled: false, openrouter: { apiKey: undefined } });
  });

  it("disables reasoning in stream response envelope", async () => {
    const toUIMessageStreamResponse = vi.fn().mockReturnValue(new Response("ok", { status: 200 }));
    streamTextMock.mockReturnValue({
      toUIMessageStreamResponse,
    });

    const res = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Help me" }],
          webSearch: false,
        }),
      }) as never,
    );

    expect(res.status).toBe(200);
    expect(toUIMessageStreamResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        sendReasoning: false,
      }),
    );
  });

  it("supports router-only configuration without OPENAI_API_KEY", async () => {
    delete process.env.OPENAI_API_KEY;
    getRouterConfigMock.mockReturnValue({ enabled: true, openrouter: { apiKey: "router-key" } });
    createCompletionWithRouterMock.mockResolvedValue({
      content: "router response",
      provider: "openrouter",
      model: "meta-llama/llama-3.1-8b-instruct:free",
    });

    const res = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Help me" }],
          webSearch: false,
        }),
      }) as never,
    );

    expect(res.status).toBe(200);
    expect(createCompletionWithRouterMock).toHaveBeenCalled();
    expect(createUIMessageStreamResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({ stream: "stream" }),
    );
  });
});
