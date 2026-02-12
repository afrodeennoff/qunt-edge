import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/server/auth'
import { logger } from '@/lib/logger'

export interface ErrorResponse {
  error: string
  code?: string
  requestId?: string
}

export interface AdminAccessContext {
  userId: string
  email: string
  requestId: string
}

class AuthzError extends Error {
  status: number
  code: string
  requestId: string

  constructor(message: string, status: number, code: string, requestId: string) {
    super(message)
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

function parseCsvEnv(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

function isAdminUser(user: User): boolean {
  const allowedUserIds = parseCsvEnv(process.env.ALLOWED_ADMIN_USER_ID)
  const adminDomains = parseCsvEnv(process.env.ADMIN_EMAIL_DOMAINS)
  const email = user.email?.toLowerCase()

  if (user.id && allowedUserIds.includes(user.id.toLowerCase())) {
    return true
  }

  if (!email) {
    return false
  }

  return adminDomains.some((domain) => {
    const normalized = domain.startsWith('@') ? domain : `@${domain}`
    return email.endsWith(normalized)
  })
}

export async function assertAdminAccess(
  requestId = crypto.randomUUID()
): Promise<AdminAccessContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user?.email) {
    throw new AuthzError('Unauthorized', 401, 'AUTH_UNAUTHORIZED', requestId)
  }

  if (!isAdminUser(user)) {
    throw new AuthzError('Forbidden', 403, 'AUTH_FORBIDDEN', requestId)
  }

  return {
    userId: user.id,
    email: user.email,
    requestId,
  }
}

export function toErrorResponse(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof AuthzError) {
    return NextResponse.json(
      { error: error.message, code: error.code, requestId: error.requestId },
      { status: error.status }
    )
  }

  const requestId = crypto.randomUUID()
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR', requestId },
    { status: 500 }
  )
}

export function logAdminMutation(params: {
  action: string
  actor: AdminAccessContext
  target?: string
  details?: Record<string, unknown>
}) {
  logger.info('[AdminMutation] action executed', {
    action: params.action,
    actorId: params.actor.userId,
    actorEmail: params.actor.email,
    target: params.target,
    requestId: params.actor.requestId,
    ...params.details,
  })
}
