import { prisma } from '@/lib/prisma'

const ACTIVE_MONTHLY_AI_TOKEN_LIMIT = 2_000_000
const INACTIVE_MONTHLY_AI_TOKEN_LIMIT = 150_000

function getUtcMonthWindow(now = new Date()): { start: Date; end: Date } {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))
  return { start, end }
}

export async function getMonthlyAiUsage(userId: string): Promise<number> {
  const { start, end } = getUtcMonthWindow()
  const aggregate = await prisma.aiRequestLog.aggregate({
    _sum: {
      totalTokens: true,
    },
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  })

  return aggregate._sum.totalTokens ?? 0
}

export async function assertWithinAiBudget(
  userId: string,
  isActive: boolean,
): Promise<{ allowed: boolean; limit: number; used: number; remaining: number }> {
  const limit = isActive ? ACTIVE_MONTHLY_AI_TOKEN_LIMIT : INACTIVE_MONTHLY_AI_TOKEN_LIMIT
  const used = await getMonthlyAiUsage(userId)
  const remaining = Math.max(0, limit - used)
  const allowed = used < limit

  return {
    allowed,
    limit,
    used,
    remaining,
  }
}
