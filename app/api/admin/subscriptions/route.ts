import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { assertAdminAccess, toErrorResponse, logAdminMutation } from '@/server/authz'
import type { Prisma } from '@/prisma/generated/prisma'
import { z } from 'zod'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'
import { parseJson, parseQuery, toValidationErrorResponse } from '@/app/api/_utils/validate'

const adminSubscriptionsReadRateLimit = rateLimit({ limit: 120, window: 60_000, identifier: 'admin-subscriptions-read' })
const adminSubscriptionsWriteRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: 'admin-subscriptions-write' })

const subscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: z.string().optional(),
  plan: z.string().optional(),
  search: z.string().optional(),
})

const patchUpdatePlanSchema = z.object({
  subscriptionId: z.string().min(1),
  action: z.literal('updatePlan'),
  plan: z.string().min(1),
  endDate: z.string().optional(),
})

const patchExtendTrialSchema = z.object({
  subscriptionId: z.string().min(1),
  action: z.literal('extendTrial'),
  days: z.number().int().min(1).max(365).optional(),
})

const patchSimpleActionSchema = z.object({
  subscriptionId: z.string().min(1),
  action: z.enum(['grantFreeAccess', 'cancel', 'reactivate']),
})

const patchBodySchema = z.union([
  patchUpdatePlanSchema,
  patchExtendTrialSchema,
  patchSimpleActionSchema,
])

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limitResult = await adminSubscriptionsReadRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    await assertAdminAccess(requestId)

    const { searchParams } = new URL(req.url)
    const { page, limit, status, plan, search } = parseQuery(searchParams, subscriptionsQuerySchema)

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

    const userIds = Array.from(new Set(subscriptions.map((sub) => sub.userId)))

    const [transactionStats, invoiceStats, refundStats] = await Promise.all([
      prisma.paymentTransaction.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.invoice.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
        },
        _count: { id: true },
      }),
      prisma.refund.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
        },
        _count: { id: true },
      }),
    ])

    const transactionByUser = new Map(
      transactionStats.map((row) => [row.userId, row])
    )
    const invoicesByUser = new Map(
      invoiceStats.map((row) => [row.userId, row._count.id])
    )
    const refundsByUser = new Map(
      refundStats.map((row) => [row.userId, row._count.id])
    )

    const subscriptionsWithStats = subscriptions.map((sub) => {
      const tx = transactionByUser.get(sub.userId)
      return {
        ...sub,
        totalSpent: tx?._sum.amount || 0,
        transactionCount: tx?._count.id || 0,
        invoiceCount: invoicesByUser.get(sub.userId) || 0,
        refundCount: refundsByUser.get(sub.userId) || 0,
      }
    })

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
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    logger.error('[Admin Subscriptions] Failed to fetch subscriptions', { error })
    return toErrorResponse(error)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limitResult = await adminSubscriptionsWriteRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    const admin = await assertAdminAccess(requestId)

    const payload = await parseJson(req, patchBodySchema)
    const { subscriptionId, action } = payload

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
        if (payload.action !== 'updatePlan') {
          return NextResponse.json({ error: 'Invalid payload for updatePlan' }, { status: 400 })
        }
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            plan: payload.plan.toUpperCase(),
            status: 'ACTIVE',
            endDate: payload.endDate ? new Date(payload.endDate) : subscription.endDate,
          },
        })
        break

      case 'extendTrial':
        if (payload.action !== 'extendTrial') {
          return NextResponse.json({ error: 'Invalid payload for extendTrial' }, { status: 400 })
        }
        const newTrialEnd = new Date()
        newTrialEnd.setDate(newTrialEnd.getDate() + (payload.days || 14))
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
        plan: payload.action === 'updatePlan' ? payload.plan : undefined,
        endDate: payload.action === 'updatePlan' ? payload.endDate : undefined,
      },
    })

    return NextResponse.json({ subscription: updatedSubscription, requestId })
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    logger.error('[Admin Subscriptions] Failed to update subscription', { error })
    return toErrorResponse(error)
  }
}
