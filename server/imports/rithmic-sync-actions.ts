'use server'
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId } from "@/server/auth"
import { Synchronization } from "@/prisma/generated/prisma"
import { withPrismaSchemaMismatchFallback } from "@/lib/prisma-guard"

async function resolveSyncUserIds() {
  const databaseUserId = await getDatabaseUserId()
  return {
    databaseUserId,
  }
}

export async function getRithmicSynchronizations() {
  const { databaseUserId } = await resolveSyncUserIds()
  const synchronizations = await withPrismaSchemaMismatchFallback(
    'sync:rithmic:list',
    () => prisma.synchronization.findMany({
      where: { userId: databaseUserId, service: "rithmic" },
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
  const { databaseUserId } = await resolveSyncUserIds()

  const deletedCount = await withPrismaSchemaMismatchFallback(
    'sync:rithmic:delete',
    async () => {
      const result = await prisma.synchronization.deleteMany({
        where: {
          userId: databaseUserId,
          service: "rithmic",
          accountId,
        },
      })
      return result.count
    },
    0
  )

  return { deletedCount }
}
