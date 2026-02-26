import { beforeEach, describe, expect, it, vi } from "vitest";

const streamTextMock = vi.fn();
const convertToModelMessagesMock = vi.fn();
const createOpenAIMock = vi.fn();
const createRouteClientMock = vi.fn();

vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => streamTextMock(...args),
  convertToModelMessages: (...args: unknown[]) => convertToModelMessagesMock(...args),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: (...args: unknown[]) => createOpenAIMock(...args),
}));

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: (...args: unknown[]) => createRouteClientMock(...args),
}));

import { POST } from "@/app/api/ai/support/route";

describe("ai support route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";

    createRouteClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u_1" } }, error: null }),
      },
    });

    createOpenAIMock.mockReturnValue(() => "model");
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
});
