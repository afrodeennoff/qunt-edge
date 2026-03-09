'use server'
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/server/auth"
import { Synchronization } from "@/prisma/generated/prisma"
import { withPrismaSchemaMismatchFallback } from "@/lib/prisma-guard"

export async function getRithmicSynchronizations() {
  const userId = await getUserId()
  const synchronizations = await withPrismaSchemaMismatchFallback(
    'sync:rithmic:list',
    () => prisma.synchronization.findMany({
      where: { userId: userId, service: "rithmic" },
    }),
    []
  )
  return synchronizations
}

export async function setRithmicSynchronization(synchronization: Partial<Synchronization>) {
  const userId = await getUserId()
  await withPrismaSchemaMismatchFallback<void>(
    'sync:rithmic:upsert',
    async () => {
      await prisma.synchronization.upsert({
        where: {
          userId_service_accountId: {
            userId: userId,
            service: synchronization.service || 'rithmic',
            accountId: synchronization.accountId || ''
          }
        },
        update: {
          ...synchronization,
          userId: userId
        },
        create: {
          ...synchronization,
          service: synchronization.service || 'rithmic',
          accountId: synchronization.accountId || '',
          lastSyncedAt: synchronization.lastSyncedAt || new Date(),
          userId: userId
        },
      })
    },
    undefined
  )
}

export async function removeRithmicSynchronization(accountId: string) {
  const userId = await getUserId()

  await withPrismaSchemaMismatchFallback<void>(
    'sync:rithmic:delete',
    async () => {
      await prisma.synchronization.deleteMany({
        where: {
          userId,
          service: "rithmic",
          accountId,
        },
      })
    },
    undefined
  )
}
