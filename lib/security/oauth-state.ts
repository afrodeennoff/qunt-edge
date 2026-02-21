import { createHash, randomUUID } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { authSecurityConfig } from "@/lib/security/auth-config"

function hashState(state: string): string {
  return createHash("sha256").update(state).digest("hex")
}

export async function createOAuthState(params: { userId: string; provider: string; rawState: string }) {
  const stateHash = hashState(params.rawState)
  const expiresAt = new Date(Date.now() + authSecurityConfig.oauthStateTtlMs)

  await prisma.oAuthState.create({
    data: {
      id: randomUUID(),
      userId: params.userId,
      provider: params.provider,
      stateHash,
      expiresAt,
    },
  })
}

export async function consumeOAuthState(params: { userId: string; provider: string; rawState: string }): Promise<boolean> {
  const stateHash = hashState(params.rawState)
  const now = new Date()

  const record = await prisma.oAuthState.findUnique({
    where: { stateHash },
    select: {
      id: true,
      userId: true,
      provider: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  if (!record) return false
  if (record.userId !== params.userId || record.provider !== params.provider) return false
  if (record.usedAt) return false
  if (record.expiresAt <= now) return false

  const result = await prisma.oAuthState.updateMany({
    where: {
      id: record.id,
      usedAt: null,
    },
    data: {
      usedAt: now,
    },
  })

  return result.count === 1
}

