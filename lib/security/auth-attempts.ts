import { createHash } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { authSecurityConfig, getLockoutDurationMs } from "@/lib/security/auth-config"

export type AuthActionType = "password_login" | "otp_verify" | "magic_link_request"

export type AuthGuardResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; message: string }

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hashEmail(email: string): string {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex")
}

function toIpPrefix(ip: string): string {
  const value = ip.trim().toLowerCase()
  if (!value || value === "unknown") return "unknown"

  if (value.includes(":")) {
    const segments = value.split(":").filter(Boolean)
    return segments.slice(0, 4).join(":") || "unknown"
  }

  const octets = value.split(".")
  if (octets.length >= 3) return octets.slice(0, 3).join(".")
  return value
}

function toRetryAfterSeconds(lockedUntil: Date | null | undefined): number {
  if (!lockedUntil) return 1
  return Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 1000))
}

export async function checkAuthGuard(params: {
  email: string
  ip: string
  actionType: AuthActionType
}): Promise<AuthGuardResult> {
  if (!authSecurityConfig.rateLimitEnabled || !authSecurityConfig.lockoutEnabled) {
    return { allowed: true }
  }

  const emailHash = hashEmail(params.email)
  const ipPrefix = toIpPrefix(params.ip)
  const now = new Date()

  const attempt = await prisma.authAttempt.findUnique({
    where: {
      emailHash_ipPrefix_actionType: {
        emailHash,
        ipPrefix,
        actionType: params.actionType,
      },
    },
  })

  if (!attempt) {
    return { allowed: true }
  }

  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: toRetryAfterSeconds(attempt.lockedUntil),
      message: "Too many authentication attempts. Please try again later.",
    }
  }

  if (attempt.firstFailureAt && now.getTime() - attempt.firstFailureAt.getTime() > authSecurityConfig.lockoutWindowMs) {
    await prisma.authAttempt.update({
      where: { id: attempt.id },
      data: {
        failCount: 0,
        firstFailureAt: null,
        lastFailureAt: null,
        lockedUntil: null,
      },
    })
  }

  return { allowed: true }
}

export async function recordAuthFailure(params: {
  email: string
  ip: string
  actionType: AuthActionType
  userId?: string | null
}) {
  if (!authSecurityConfig.rateLimitEnabled) return

  const emailHash = hashEmail(params.email)
  const ipPrefix = toIpPrefix(params.ip)
  const now = new Date()

  const existing = await prisma.authAttempt.findUnique({
    where: {
      emailHash_ipPrefix_actionType: {
        emailHash,
        ipPrefix,
        actionType: params.actionType,
      },
    },
  })

  if (!existing) {
    await prisma.authAttempt.create({
      data: {
        userId: params.userId ?? null,
        emailHash,
        ipPrefix,
        actionType: params.actionType,
        failCount: 1,
        firstFailureAt: now,
        lastFailureAt: now,
      },
    })
    return
  }

  const windowExpired =
    existing.firstFailureAt &&
    now.getTime() - existing.firstFailureAt.getTime() > authSecurityConfig.lockoutWindowMs

  const nextFailCount = windowExpired ? 1 : existing.failCount + 1
  const firstFailureAt = windowExpired || !existing.firstFailureAt ? now : existing.firstFailureAt
  const shouldLock = authSecurityConfig.lockoutEnabled && nextFailCount >= authSecurityConfig.lockoutThreshold
  const lockedUntil = shouldLock ? new Date(now.getTime() + getLockoutDurationMs(nextFailCount)) : null

  await prisma.authAttempt.update({
    where: { id: existing.id },
    data: {
      userId: params.userId ?? existing.userId,
      failCount: nextFailCount,
      firstFailureAt,
      lastFailureAt: now,
      lockedUntil,
    },
  })
}

export async function recordAuthSuccess(params: {
  email: string
  ip: string
  actionType: AuthActionType
  userId?: string | null
}) {
  if (!authSecurityConfig.rateLimitEnabled) return

  const emailHash = hashEmail(params.email)
  const ipPrefix = toIpPrefix(params.ip)
  const now = new Date()

  const existing = await prisma.authAttempt.findUnique({
    where: {
      emailHash_ipPrefix_actionType: {
        emailHash,
        ipPrefix,
        actionType: params.actionType,
      },
    },
  })

  if (!existing) return

  await prisma.authAttempt.update({
    where: { id: existing.id },
    data: {
      userId: params.userId ?? existing.userId,
      failCount: 0,
      firstFailureAt: null,
      lastFailureAt: null,
      lockedUntil: null,
      lastSuccessAt: now,
    },
  })
}
