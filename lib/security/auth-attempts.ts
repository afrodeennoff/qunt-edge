import { createHash } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { authSecurityConfig, getLockoutDurationMs } from "@/lib/security/auth-config"

export type AuthActionType = "password_login" | "otp_verify" | "magic_link_request"

export type AuthGuardResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; message: string }

function isMissingAuthAttemptTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const maybeError = error as { code?: string; message?: string }
  if (maybeError.code === "P2021") return true
  const message = (maybeError.message || "").toLowerCase()
  return message.includes("authattempt") && message.includes("does not exist")
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hashEmail(email: string): string {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex")
}

function normalizeIpPrefix(ip: string): string {
  const normalized = ip.trim()
  if (!normalized) return "unknown"
  if (normalized.includes(":")) {
    return normalized.split(":").slice(0, 4).join(":")
  }
  const octets = normalized.split(".")
  if (octets.length === 4) return `${octets[0]}.${octets[1]}.${octets[2]}`
  return normalized
}

export async function checkAuthGuard(params: {
  email: string
  ip: string
  actionType: AuthActionType
}): Promise<AuthGuardResult> {
  if (!authSecurityConfig.lockoutEnabled) return { allowed: true }
  try {
    const emailHash = hashEmail(params.email)
    const ipPrefix = normalizeIpPrefix(params.ip)
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

    if (!existing?.lockedUntil) return { allowed: true }
    if (existing.lockedUntil <= now) return { allowed: true }

    const retryAfterSeconds = Math.max(1, Math.ceil((existing.lockedUntil.getTime() - now.getTime()) / 1000))
    return {
      allowed: false,
      retryAfterSeconds,
      message: "Invalid credentials or verification required",
    }
  } catch (error) {
    if (isMissingAuthAttemptTableError(error)) return { allowed: true }
    throw error
  }
}

export async function recordAuthFailure(params: {
  email: string
  ip: string
  actionType: AuthActionType
  userId?: string | null
}) {
  if (!authSecurityConfig.lockoutEnabled) return
  try {
    const emailHash = hashEmail(params.email)
    const ipPrefix = normalizeIpPrefix(params.ip)
    const now = new Date()
    const windowStart = new Date(now.getTime() - authSecurityConfig.lockoutWindowMs)

    const existing = await prisma.authAttempt.findUnique({
      where: {
        emailHash_ipPrefix_actionType: {
          emailHash,
          ipPrefix,
          actionType: params.actionType,
        },
      },
    })

    const shouldResetWindow = !existing?.lastFailureAt || existing.lastFailureAt < windowStart
    const nextFailCount = shouldResetWindow ? 1 : (existing?.failCount ?? 0) + 1
    const shouldLock = nextFailCount >= authSecurityConfig.lockoutThreshold
    const lockedUntil = shouldLock ? new Date(now.getTime() + getLockoutDurationMs(nextFailCount)) : null

    await prisma.authAttempt.upsert({
      where: {
        emailHash_ipPrefix_actionType: {
          emailHash,
          ipPrefix,
          actionType: params.actionType,
        },
      },
      create: {
        userId: params.userId ?? null,
        emailHash,
        ipPrefix,
        actionType: params.actionType,
        failCount: nextFailCount,
        firstFailureAt: now,
        lastFailureAt: now,
        lockedUntil,
      },
      update: {
        userId: params.userId ?? existing?.userId ?? null,
        failCount: nextFailCount,
        firstFailureAt: shouldResetWindow ? now : existing?.firstFailureAt ?? now,
        lastFailureAt: now,
        lockedUntil,
      },
    })
  } catch (error) {
    if (isMissingAuthAttemptTableError(error)) return
    throw error
  }
}

export async function recordAuthSuccess(params: {
  email: string
  ip: string
  actionType: AuthActionType
  userId?: string | null
}) {
  try {
    const emailHash = hashEmail(params.email)
    const ipPrefix = normalizeIpPrefix(params.ip)
    const now = new Date()

    await prisma.authAttempt.upsert({
      where: {
        emailHash_ipPrefix_actionType: {
          emailHash,
          ipPrefix,
          actionType: params.actionType,
        },
      },
      create: {
        userId: params.userId ?? null,
        emailHash,
        ipPrefix,
        actionType: params.actionType,
        failCount: 0,
        lastSuccessAt: now,
        lockedUntil: null,
      },
      update: {
        userId: params.userId ?? null,
        failCount: 0,
        firstFailureAt: null,
        lastFailureAt: null,
        lockedUntil: null,
        lastSuccessAt: now,
      },
    })
  } catch (error) {
    if (isMissingAuthAttemptTableError(error)) return
    throw error
  }
}
