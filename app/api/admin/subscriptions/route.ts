import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { securityManager } from '@/server/payment-security'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')

    const where: any = {}

    if (status) {
      where.status = status.toUpperCase()
    }

    if (plan) {
      where.plan = plan.toUpperCase()
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userId: { contains: search } },
      ]
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ])

    const subscriptionsWithStats = await Promise.all(
      subscriptions.map(async (sub) => {
        const [transactions, invoiceCount, refundCount] = await Promise.all([
          prisma.paymentTransaction.aggregate({
            where: { userId: sub.userId, status: 'COMPLETED' },
            _sum: { amount: true },
            _count: { id: true },
          }),
          prisma.invoice.count({ where: { userId: sub.userId } }),
          prisma.refund.count({ where: { userId: sub.userId } }),
        ])

        return {
          ...sub,
          totalSpent: transactions._sum.amount || 0,
          transactionCount: transactions._count,
          invoiceCount,
          refundCount,
        }
      })
    )

    return NextResponse.json({
      subscriptions: subscriptionsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('[Admin Subscriptions] Failed to fetch subscriptions', { error })
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json()
    const { subscriptionId, action, ...data } = body

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    let updatedSubscription

    switch (action) {
      case 'updatePlan':
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            plan: data.plan.toUpperCase(),
            status: 'ACTIVE',
            endDate: data.endDate ? new Date(data.endDate) : subscription.endDate,
          },
        })
        break

      case 'extendTrial':
        const newTrialEnd = new Date()
        newTrialEnd.setDate(newTrialEnd.getDate() + (data.days || 14))
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'TRIAL',
            trialEndsAt: newTrialEnd,
            endDate: newTrialEnd,
          },
        })
        break

      case 'grantFreeAccess':
        const freeAccessEnd = new Date()
        freeAccessEnd.setFullYear(freeAccessEnd.getFullYear() + 100)
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'ACTIVE',
            plan: 'FREE',
            endDate: freeAccessEnd,
          },
        })
        break

      case 'cancel':
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'CANCELLED',
            endDate: new Date(),
          },
        })
        break

      case 'reactivate':
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'ACTIVE',
            endDate,
          },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    logger.info('[Admin Subscriptions] Subscription updated', {
      subscriptionId,
      action,
      adminEmail: user.email,
    })

    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    logger.error('[Admin Subscriptions] Failed to update subscription', { error })
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
