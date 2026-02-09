import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDomains = process.env.ADMIN_EMAIL_DOMAINS?.split(',') || []
    const isAdmin = adminDomains.some((domain) =>
      user.email?.toLowerCase().endsWith(domain.toLowerCase())
    )

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
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
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('[Admin Reports] Failed to generate report', { error })
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateOverviewReport(dateFilter: any) {
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
        status: { in: ['ACTIVE', 'TRIAL'] },
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

  const mrr = await calculateMRR()
  const arr = await calculateARR()
  const arpu = await calculateARPU()
  const ltv = await calculateLTV()

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

async function generateRevenueReport(dateFilter: any) {
  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: dateFilter,
    },
    orderBy: { createdAt: 'asc' },
  })

  const revenueByPlan = await prisma.$queryRaw`
    SELECT 
      s.plan,
      COUNT(DISTINCT s.userId) as unique_users,
      SUM(pt.amount) as total_revenue
    FROM "Subscription" s
    INNER JOIN "PaymentTransaction" pt ON pt.userId = s.userId
    WHERE pt.status = 'COMPLETED' 
      AND pt.createdAt >= ${dateFilter.gte || new Date(0)}
      AND pt.createdAt <= ${dateFilter.lte || new Date()}
    GROUP BY s.plan
  `

  const revenueByMonth = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', createdAt) as month,
      SUM(amount) as revenue
    FROM "PaymentTransaction"
    WHERE status = 'COMPLETED'
      AND createdAt >= ${dateFilter.gte || new Date(0)}
      AND createdAt <= ${dateFilter.lte || new Date()}
    GROUP BY DATE_TRUNC('month', createdAt)
    ORDER BY month
  `

  return NextResponse.json({
    transactions,
    revenueByPlan,
    revenueByMonth,
  })
}

async function generateChurnReport(dateFilter: any) {
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

async function generateSubscriptionReport(dateFilter: any) {
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

async function generateTransactionReport(dateFilter: any) {
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
    ? Math.round((totalRevenue._sum.amount || 0) / activeSubs)
    : 0
}

async function calculateLTV(): Promise<number> {
  const arpu = await calculateARPU()
  const churnRate = 0.05

  return arpu / churnRate
}
