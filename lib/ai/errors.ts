/**
 * Unified error helper for AI routes.
 * Provides consistent error shape across all AI API endpoints.
 */

export type AiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'BUDGET_EXCEEDED'
  | 'VALIDATION_FAILED'
  | 'PROMPT_REJECTED'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | string

export interface AiErrorResponse {
  error: {
    code: AiErrorCode
    message: string
    details?: Record<string, unknown>
    budget?: {
      limit: number
      used: number
      remaining: number
    }
    retryAfter?: number
  }
}

/**
 * Creates a consistent error response for AI routes.
 * All AI errors return: { error: { code, message, details? } }
 */
export function aiError(
  status: number,
  code: AiErrorCode,
  message: string,
  details?: Record<string, unknown>,
): Response {
  const body: AiErrorResponse = {
    error: {
      code,
      message,
    },
  }

  if (details) {
    body.error.details = details
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

/**
 * Creates a budget-exceeded error with budget metadata.
 */
export function aiBudgetError(
  limit: number,
  used: number,
  remaining: number,
): Response {
  return aiError(
    429,
    'BUDGET_EXCEEDED',
    'Monthly AI token budget exhausted',
    {
      budget: {
        limit,
        used,
        remaining,
      },
      retryAfter: 30, // Suggest retry after 30 seconds (new month resets)
    },
  )
}

/**
 * Creates an unauthorized error.
 */
export function aiUnauthorizedError(message = 'Authentication required'): Response {
  return aiError(401, 'UNAUTHORIZED', message)
}

/**
 * Creates a forbidden error (no entitlement).
 */
export function aiForbiddenError(
  message: string,
  details?: Record<string, unknown>,
): Response {
  return aiError(403, 'FORBIDDEN', message, details)
}

/**
 * Creates a rate limit error.
 */
export function aiRateLimitError(
  message = 'Too many requests. Please try again later.',
  retryAfter = 60,
): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: 'RATE_LIMITED',
        message,
        retryAfter,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}

/**
 * Creates a validation error.
 */
export function aiValidationError(
  message: string,
  details?: Record<string, unknown>,
): Response {
  return aiError(422, 'VALIDATION_FAILED', message, details)
}

/**
 * Creates a prompt rejected error.
 */
export function aiPromptRejectedError(message: string): Response {
  return aiError(422, 'PROMPT_REJECTED', message)
}

/**
 * Creates a service unavailable error.
 */
export function aiServiceError(
  message = 'AI service temporarily unavailable',
): Response {
  return aiError(503, 'SERVICE_UNAVAILABLE', message)
}

/**
 * Creates an internal error.
 */
export function aiInternalError(
  message = 'An unexpected error occurred',
): Response {
  return aiError(500, 'INTERNAL_ERROR', message)
}
