import { describe, expect, it } from "vitest";
import { RequestValidationError, toValidationErrorResponse } from "@/app/api/_utils/validate";
import { z } from "zod";

describe("toValidationErrorResponse", () => {
  it("preserves the request validation code, status, and details", async () => {
    const validationError = new RequestValidationError(
      "Bad query",
      422,
      { field: "teamId" },
      "BAD_REQUEST"
    );

    const response = toValidationErrorResponse(validationError);
    expect(response.status).toBe(422);
    const body = await response.json();

    expect(body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Bad query",
        details: { field: "teamId" },
      },
    });
  });

  it("wraps a ZodError into VALIDATION_FAILED with issues", async () => {
    const schema = z.object({ foo: z.string().min(5) });
    const parsed = schema.safeParse({ foo: "nope" });
    expect(parsed.success).toBe(false);

    const response = toValidationErrorResponse(parsed.error);
    expect(response.status).toBe(400);
    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(Array.isArray(body.error.details?.issues)).toBe(true);
  });

  it("falls back to an internal error envelope for unknown errors", async () => {
    const response = toValidationErrorResponse(new Error("boom"));
    expect(response.status).toBe(500);
    const body = await response.json();

    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toBe("Internal server error");
  });
});
