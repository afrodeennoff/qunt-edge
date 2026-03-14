import { type ZodType, z } from "zod";
import { ApiErrorCode, apiError } from "@/lib/api-response";

export class RequestValidationError extends Error {
  status: number;
  details?: unknown;
  code: ApiErrorCode;

  constructor(
    message: string,
    status = 400,
    details?: unknown,
    code: ApiErrorCode = "VALIDATION_FAILED"
  ) {
    super(message);
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>
): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new RequestValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new RequestValidationError("Request validation failed", 400, {
      issues: result.error.issues,
    });
  }

  return result.data;
}

export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodType<T>
): T {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new RequestValidationError("Query validation failed", 400, {
      issues: result.error.issues,
    });
  }
  return result.data;
}

export function toValidationErrorResponse(error: unknown) {
  if (error instanceof RequestValidationError) {
    return apiError(error.code, error.message, error.status, error.details);
  }

  if (error instanceof z.ZodError) {
    return apiError("VALIDATION_FAILED", "Validation failed", 400, {
      issues: error.issues,
    });
  }

  return apiError("INTERNAL_ERROR", "Internal server error", 500);
}
