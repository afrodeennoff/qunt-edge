import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";

export class RequestValidationError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
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
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.issues },
      { status: 400 }
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
