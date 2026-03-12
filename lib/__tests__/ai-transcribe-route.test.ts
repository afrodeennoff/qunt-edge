import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: vi.fn(async () => ({ ok: true, userId: "u_1", email: "u_1@example.com" })),
}));

import { POST } from "@/app/api/ai/transcribe/route";

describe("ai transcribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
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
