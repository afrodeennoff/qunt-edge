import { prisma } from './prisma'

export async function isWebhookProcessed(webhookId: string, webhookType: string): Promise<boolean> {
  const processed = await prisma.processedWebhook.findUnique({
    where: {
      webhookId_type: {
        webhookId,
        type: webhookType,
      },
    },
  })

  return !!processed
}

export async function markWebhookProcessed(
  webhookId: string,
  webhookType: string,
  metadata?: Record<string, any>
): Promise<void> {
  await prisma.processedWebhook.create({
    data: {
      webhookId,
      type: webhookType,
      processedAt: new Date(),
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

export async function cleanupOldProcessedWebhooks(daysToKeep = 30): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await prisma.processedWebhook.deleteMany({
    where: {
      processedAt: {
        lt: cutoffDate,
      },
    },
  })

  return result.count
}
