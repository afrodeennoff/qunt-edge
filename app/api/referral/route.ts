import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/server/auth'
import {
  getOrCreateReferral,
  getReferralBySlug,
  addReferredUser,
  getReferralTier,
  getNextTier,
  ReferralAlreadyAppliedError,
} from '@/server/referral'
import { logger } from '@/lib/logger'

function isUnauthenticatedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === 'User not authenticated' ||
      error.message.includes('Missing Supabase environment variables'))
  )
}

const cacheHeaders = {
  'Cache-Control': 'private, max-age=20, stale-while-revalidate=60',
}

export async function GET() {
  try {
    const userId = await getDatabaseUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create referral for the user
    const referral = await getOrCreateReferral(userId)
    const count = referral.redemptions.length
    const tier = await getReferralTier(count)
    const nextTier = await getNextTier(count)

    const referredUsers = referral.redemptions
      .map((redemption) => redemption.referredUser)
      .sort((a, b) => a.email.localeCompare(b.email))

    return NextResponse.json(
      {
        success: true,
        data: {
          referral: {
            id: referral.id,
            slug: referral.slug,
            count,
            tier,
            nextTier,
            referredUsers,
          },
        },
      },
      { headers: cacheHeaders }
    )
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    logger.error('[referral/GET] Error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug } = body

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Referral slug is required' },
        { status: 400 }
      )
    }

    const userId = await getDatabaseUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find referral by slug
    const referral = await getReferralBySlug(slug)

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Check if user is trying to use their own referral code
    if (referral.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot use your own referral code' },
        { status: 400 }
      )
    }

    await addReferredUser(referral.id, userId)

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
    })
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error instanceof ReferralAlreadyAppliedError) {
      return NextResponse.json(
        { error: 'You have already been referred' },
        { status: 400 }
      )
    }
    logger.error('[referral/POST] Error', { error })
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    )
  }
}
