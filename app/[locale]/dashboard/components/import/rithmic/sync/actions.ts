'use server'
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/server/auth"
import { Synchronization } from "@/prisma/generated/prisma"
import { logger } from "@/lib/logger"

export async function getRithmicSynchronizations() {
  logger.info('CHECKING RITHMIC SYNCHRONIZATIONS')
  const userId = await getUserId()
  const synchronizations = await prisma.synchronization.findMany({
    where: { userId: userId, service: "rithmic" },
  })
  return synchronizations
}

export async function setRithmicSynchronization(synchronization: Partial<Synchronization>) {
  logger.info('SETTING RITHMIC SYNCHRONIZATION')
  const userId = await getUserId()
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
}

export async function removeRithmicSynchronization(accountId: string) {
  logger.info('REMOVING RITHMIC SYNCHRONIZATION')
  const userId = await getUserId()

  await prisma.synchronization.deleteMany({
    where: {
      userId,
      service: "rithmic",
      accountId,
    },
  })
}