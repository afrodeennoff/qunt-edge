'use server'
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId, getUserId } from "@/server/auth"
import { Synchronization } from "@/prisma/generated/prisma"
import { withPrismaSchemaMismatchFallback } from "@/lib/prisma-guard"

async function resolveSyncUserIds() {
  const authUserId = await getUserId()
  const databaseUserId = await getDatabaseUserId()
  return {
    databaseUserId,
    candidateUserIds: Array.from(new Set([databaseUserId, authUserId])),
  }
}

export async function getRithmicSynchronizations() {
  const { candidateUserIds } = await resolveSyncUserIds()
  const synchronizations = await withPrismaSchemaMismatchFallback(
    'sync:rithmic:list',
    () => prisma.synchronization.findMany({
      where: { userId: { in: candidateUserIds }, service: "rithmic" },
    }),
    []
  )
  return synchronizations
}

export async function setRithmicSynchronization(synchronization: Partial<Synchronization>) {
  const { databaseUserId } = await resolveSyncUserIds()
  await withPrismaSchemaMismatchFallback<void>(
    'sync:rithmic:upsert',
    async () => {
      await prisma.synchronization.upsert({
        where: {
          userId_service_accountId: {
            userId: databaseUserId,
            service: synchronization.service || 'rithmic',
            accountId: synchronization.accountId || ''
          }
        },
        update: {
          ...synchronization,
          userId: databaseUserId
        },
        create: {
          ...synchronization,
          service: synchronization.service || 'rithmic',
          accountId: synchronization.accountId || '',
          lastSyncedAt: synchronization.lastSyncedAt || new Date(),
          userId: databaseUserId
        },
      })
    },
    undefined
  )
}

export async function removeRithmicSynchronization(accountId: string) {
  const { candidateUserIds } = await resolveSyncUserIds()

  await withPrismaSchemaMismatchFallback<void>(
    'sync:rithmic:delete',
    async () => {
      await prisma.synchronization.deleteMany({
        where: {
          userId: { in: candidateUserIds },
          service: "rithmic",
          accountId,
        },
      })
    },
    undefined
  )
}
