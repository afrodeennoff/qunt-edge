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
    process.env.OPENROUTER_API_KEY = "test-key";
    delete process.env.OPENAI_API_KEY;
    convertToModelMessagesMock.mockResolvedValue([{ role: "user", content: "hello" }]);
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
    expect(streamTextMock).toHaveBeenCalled();
    expect(createCompletionWithRouterMock).not.toHaveBeenCalled();
  });
});
