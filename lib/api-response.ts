import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'VALIDATION_FAILED'
  | 'INTERNAL_ERROR'
  | string

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
  headers?: HeadersInit,
) {
  const resolvedHeaders = new Headers(headers);
  if (!resolvedHeaders.has('Cache-Control')) {
    resolvedHeaders.set('Cache-Control', 'no-store, max-age=0');
  }
  return NextResponse.json(
    { error: { code, message, details } },
    { status, headers: resolvedHeaders },
  )
}
