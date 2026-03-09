import { beforeEach, describe, expect, it, vi } from "vitest";

const createRouteClientMock = vi.fn();

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: (...args: unknown[]) => createRouteClientMock(...args),
}));

import { POST } from "@/app/api/ai/transcribe/route";

describe("ai transcribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    createRouteClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u_1" } }, error: null }),
      },
    });
  });

  it("returns 413 on oversized content-length before parsing form-data", async () => {
    const res = await POST(
      new Request("http://localhost/api/ai/transcribe", {
        method: "POST",
        headers: {
          "content-type": "multipart/form-data; boundary=test",
          "content-length": String(30 * 1024 * 1024),
        },
        body: "--test--",
      }) as never,
    );

    expect(res.status).toBe(413);
  });

  it("returns 415 for unsupported audio mime-type", async () => {
    const form = new FormData();
    form.append("audio", new File(["hello"], "sample.txt", { type: "text/plain" }));

    const res = await POST(
      new Request("http://localhost/api/ai/transcribe", {
        method: "POST",
        body: form,
      }) as never,
    );

    expect(res.status).toBe(415);
  });
});
