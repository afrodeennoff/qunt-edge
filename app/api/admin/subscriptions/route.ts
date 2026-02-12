import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { assertAdminAccess, toErrorResponse, logAdminMutation } from '@/server/authz'
import type { Prisma } from '@/prisma/generated/prisma'

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    await assertAdminAccess(requestId)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')

    const where: Prisma.SubscriptionWhereInput = {}

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
      requestId,
    })
  } catch (error) {
    logger.error('[Admin Subscriptions] Failed to fetch subscriptions', { error })
    return toErrorResponse(error)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const admin = await assertAdminAccess(requestId)

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

    logAdminMutation({
      action: `subscription-${action}`,
      actor: admin,
      target: subscriptionId,
      details: {
        plan: data.plan,
        endDate: data.endDate,
      },
    })

    return NextResponse.json({ subscription: updatedSubscription, requestId })
  } catch (error) {
    logger.error('[Admin Subscriptions] Failed to update subscription', { error })
    return toErrorResponse(error)
  }
}
