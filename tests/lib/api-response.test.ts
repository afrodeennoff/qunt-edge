import { describe, expect, it } from "vitest";
import { apiError } from "@/lib/api-response";

describe("apiError helper", () => {
  it("builds a structured envelope and sets the cache-control header", async () => {
    const response = apiError("BAD_REQUEST", "Bad payload", 400, { reason: "malformed" });
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const body = await response.json();
    expect(body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Bad payload",
        details: { reason: "malformed" },
      },
    });
  });

  it("omits details when none are provided", async () => {
    const response = apiError("INTERNAL_ERROR", "boom", 500);
    const body = await response.json();
    expect(body.error.details).toBeUndefined();
  });
});
