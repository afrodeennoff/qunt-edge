import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { assertAdminAccess } from '@/server/authz'
import { apiError } from '@/lib/api-response'
import { parseQuery, toValidationErrorResponse } from '@/app/api/_utils/validate'
import { z } from 'zod'

type DateFilter = { gte?: Date; lte?: Date }

const reportTypeSchema = z.enum([
  'overview',
  'revenue',
  'churn',
  'subscriptions',
  'transactions',
])

const adminReportsQuerySchema = z.object({
  type: reportTypeSchema.default('overview'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

function parseDateParam(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function buildDateFilter(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): DateFilter {
  const dateFilter: DateFilter = {}
  const parsedStartDate = parseDateParam(startDate)
  const parsedEndDate = parseDateParam(endDate)
  if (parsedStartDate) dateFilter.gte = parsedStartDate
  if (parsedEndDate) dateFilter.lte = parsedEndDate
  return dateFilter
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    await assertAdminAccess(requestId)

    const {
      type: reportType,
      startDate,
      endDate,
    } = parseQuery(req.nextUrl.searchParams, adminReportsQuerySchema)

    if (startDate && !parseDateParam(startDate)) {
      return apiError('BAD_REQUEST', 'Invalid startDate', 400, { requestId })
    }

    if (endDate && !parseDateParam(endDate)) {
      return apiError('BAD_REQUEST', 'Invalid endDate', 400, { requestId })
    }

    const dateFilter = buildDateFilter(startDate, endDate)

    if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
      return apiError('BAD_REQUEST', 'startDate must be before endDate', 400, { requestId })
    }

    switch (reportType) {
      case 'overview':
        return await generateOverviewReport(dateFilter)
      case 'revenue':
        return await generateRevenueReport(dateFilter)
      case 'churn':
        return await generateChurnReport(dateFilter)
      case 'subscriptions':
        return await generateSubscriptionReport(dateFilter)
      case 'transactions':
        return await generateTransactionReport(dateFilter)
      default:
        return apiError('BAD_REQUEST', 'Invalid report type', 400, { requestId })
    }
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      'code' in error &&
      'message' in error
    ) {
      const status = Number((error as { status: unknown }).status)
      const code = String((error as { code: unknown }).code)
      const message = String((error as { message: unknown }).message)
      if (Number.isFinite(status) && status >= 400 && status <= 599) {
        return apiError(code, message, status, { requestId })
      }
    }

    logger.error('[Admin Reports] Failed to generate report', { error })
    return apiError('INTERNAL_ERROR', 'Internal server error', 500, { requestId })
  }
}

async function generateOverviewReport(dateFilter: DateFilter) {
  const [
    totalRevenue,
    activeSubscriptions,
    newSubscriptions,
    cancelledSubscriptions,
    totalTransactions,
    totalRefunds,
    trialConversions,
  ] = await Promise.all([
    prisma.paymentTransaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: dateFilter,
      },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.subscription.count({
      where: {
        createdAt: dateFilter,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    }),
    prisma.subscription.count({
      where: {
        createdAt: dateFilter,
        status: 'CANCELLED',
      },
    }),
    prisma.paymentTransaction.count({
      where: { createdAt: dateFilter },
    }),
    prisma.refund.count({
      where: { createdAt: dateFilter },
    }),
    prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        createdAt: dateFilter,
      },
    }),
  ])

  // Run independent calculations in parallel, then derive dependent values
  const [mrr, arpu] = await Promise.all([
    calculateMRR(),
    calculateARPU(),
  ])

  // ARR = MRR * 12, LTV = ARPU / churnRate (0.05)
  const arr = mrr * 12
  const ltv = arpu / 0.05

  return NextResponse.json({
    overview: {
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      newSubscriptions,
      cancelledSubscriptions,
      totalTransactions,
      totalRefunds,
      trialConversions,
      mrr,
      arr,
      arpu,
      ltv,
    },
  })
}

async function generateRevenueReport(dateFilter: DateFilter) {
  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: dateFilter,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Security: Use type-safe Prisma queries instead of raw SQL
  const revenueByPlan = await prisma.subscription.groupBy({
    by: ['plan'],
    where: {
      user: {
        paymentTransactions: {
          some: {
            status: 'COMPLETED',
            createdAt: dateFilter,
          }
        }
      }
    },
    _count: {
      userId: true,
    },
  })

  // Get total revenue per plan using aggregations
  const transactionsForRevenue = await prisma.paymentTransaction.groupBy({
    by: ['userId'],
    where: {
      status: 'COMPLETED',
      createdAt: dateFilter,
    },
    _sum: {
      amount: true,
    },
  })

  // Map subscriptions to their plans
  const subscriptions = await prisma.subscription.findMany({
    where: {
      user: {
        paymentTransactions: {
          some: {
            status: 'COMPLETED',
            createdAt: dateFilter,
          }
        }
      }
    },
    select: {
      plan: true,
      userId: true,
    },
  })

  // Calculate revenue by plan
  const planRevenueMap = new Map<string, number>()
  subscriptions.forEach(sub => {
    const userRevenue = transactionsForRevenue.find(t => t.userId === sub.userId)?._sum.amount || 0
    planRevenueMap.set(sub.plan, (planRevenueMap.get(sub.plan) || 0) + Number(userRevenue))
  })

  const revenueByPlanFormatted = Array.from(planRevenueMap.entries()).map(([plan, revenue]) => ({
    plan,
    unique_users: revenueByPlan.find(r => r.plan === plan)?._count.userId || 0,
    total_revenue: revenue,
  }))

  // Revenue by month using Prisma aggregate with date extraction
  // Group by month manually since Prisma doesn't support DATE_TRUNC
  const allTransactions = await prisma.paymentTransaction.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: dateFilter,
    },
    select: {
      createdAt: true,
      amount: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by month in JavaScript (safe - no raw SQL)
  const monthlyRevenue = new Map<string, number>()
  for (const tx of allTransactions) {
    const monthKey = `${tx.createdAt.getFullYear()}-${String(tx.createdAt.getMonth() + 1).padStart(2, '0')}`
    monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + Number(tx.amount))
  }

  const revenueByMonth = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
    month: new Date(month + '-01'),
    revenue,
  }))

  return NextResponse.json({
    transactions,
    revenueByPlan: revenueByPlanFormatted,
    revenueByMonth,
  })
}

async function generateChurnReport(dateFilter: DateFilter) {
  const cancelledSubs = await prisma.subscription.findMany({
    where: {
      status: 'CANCELLED',
      updatedAt: dateFilter,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const activeSubsAtStart = await prisma.subscription.count({
    where: {
      status: 'ACTIVE',
      createdAt: { lt: dateFilter.gte || new Date() },
    },
  })

  const churnRate =
    activeSubsAtStart > 0
      ? (cancelledSubs.length / activeSubsAtStart) * 100
      : 0

  const churnByPlan = cancelledSubs.reduce((acc, sub) => {
    const plan = sub.plan || 'UNKNOWN'
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const cancellationReasons = await prisma.subscriptionFeedback.findMany({
    where: {
      event: 'CANCELLED',
      createdAt: dateFilter,
    },
  })

  const reasonCounts = cancellationReasons.reduce((acc, feedback) => {
    const reason = feedback.cancellationReason || 'unspecified'
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json({
    churnRate: churnRate.toFixed(2) + '%',
    cancelledSubscriptions: cancelledSubs.length,
    activeSubscriptionsAtStart: activeSubsAtStart,
    churnByPlan,
    cancellationReasons: reasonCounts,
    recentCancellations: cancelledSubs.slice(0, 20),
  })
}

async function generateSubscriptionReport(dateFilter: DateFilter) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      createdAt: dateFilter,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const subscriptionCounts = await prisma.subscription.groupBy({
    by: ['plan', 'status'],
    _count: { id: true },
  })

  const trialToPaid = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      trialEndsAt: { not: null },
    },
  })

  const conversions = trialToPaid.filter(
    (sub) => sub.endDate && sub.endDate > (sub.trialEndsAt || new Date())
  ).length

  const conversionRate =
    trialToPaid.length > 0 ? (conversions / trialToPaid.length) * 100 : 0

  return NextResponse.json({
    totalNewSubscriptions: subscriptions.length,
    subscriptionBreakdown: subscriptionCounts,
    trialConversions: conversions,
    conversionRate: conversionRate.toFixed(2) + '%',
    recentSubscriptions: subscriptions.slice(0, 50),
  })
}

async function generateTransactionReport(dateFilter: DateFilter) {
  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      createdAt: dateFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const transactionStats = await prisma.paymentTransaction.groupBy({
    by: ['status', 'type'],
    _count: { id: true },
    _sum: { amount: true },
    where: {
      createdAt: dateFilter,
    },
  })

  const failedTransactions = await prisma.paymentTransaction.findMany({
    where: {
      status: 'FAILED',
      createdAt: dateFilter,
    },
    take: 50,
  })

  return NextResponse.json({
    transactions,
    stats: transactionStats,
    failedTransactions,
  })
}

async function calculateMRR(): Promise<number> {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
  })

  let mrr = 0
  for (const sub of subscriptions) {
    if (sub.interval === 'month') {
      mrr += 29
    } else if (sub.interval === 'quarter') {
      mrr += 75 / 3
    } else if (sub.interval === 'year') {
      mrr += 250 / 12
    }
  }

  return Math.round(mrr)
}

async function calculateARR(): Promise<number> {
  const mrr = await calculateMRR()
  return mrr * 12
}

async function calculateARPU(): Promise<number> {
  const [activeSubs, totalRevenue] = await Promise.all([
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.paymentTransaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ])

  return activeSubs > 0
    ? Math.round(Number(totalRevenue._sum.amount ?? 0) / activeSubs)
    : 0
}

async function calculateLTV(): Promise<number> {
  const arpu = await calculateARPU()
  const churnRate = 0.05

  return arpu / churnRate
}
