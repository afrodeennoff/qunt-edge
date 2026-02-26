import { prisma } from '@/lib/prisma'
import { createSecureSlug } from '@/lib/security/slug'

export type ReferralTier = {
  level: number
  reward: string
  count: number
}

export class ReferralAlreadyAppliedError extends Error {
  constructor(message = 'Referral already applied') {
    super(message)
    this.name = 'ReferralAlreadyAppliedError'
  }
}

async function getReferralWithRedemptions(referralId: string) {
  return prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      redemptions: {
        include: {
          referredUser: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

// Get or create a referral for a user
export async function getOrCreateReferral(userId: string) {
  try {
    let referral = await prisma.referral.findUnique({
      where: { userId },
      include: {
        redemptions: {
          include: {
            referredUser: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // If no referral exists, create one
    if (!referral) {
      let slug = createSecureSlug(8)
      let attempts = 0
      const maxAttempts = 8

      // Keep trying to find a unique slug
      while (attempts < maxAttempts) {
        try {
          referral = await prisma.referral.create({
            data: {
              userId,
              slug,
            },
            include: {
              redemptions: {
                include: {
                  referredUser: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          })
          break
        } catch (error: unknown) {
          const prismaError = error as { code?: string }
          if (prismaError?.code === 'P2002') {
            // P2002 is Prisma's error code for unique constraint violation
            slug = createSecureSlug(8)
            attempts++
            continue
          }
          throw error
        }
      }

      if (!referral) {
        throw new Error('Failed to generate unique referral slug after multiple attempts')
      }
    }

    return referral
  } catch (error) {
    console.error('Error getting or creating referral:', error)
    throw error
  }
}

// Add a referred user to a referral
export async function addReferredUser(referralId: string, referredUserId: string) {
  try {
    const referral = await prisma.$transaction(async (tx) => {
      const existingReferral = await tx.referral.findUnique({
        where: { id: referralId },
      })

      if (!existingReferral) {
        throw new Error('Referral not found')
      }

      const existingRedemption = await tx.referralRedemption.findUnique({
        where: { referredUserId },
      })

      if (existingRedemption) {
        if (existingRedemption.referralId === referralId) {
          return getReferralWithRedemptions(referralId)
        }
        throw new ReferralAlreadyAppliedError('User has already applied another referral code')
      }

      await tx.referralRedemption.create({
        data: {
          referralId,
          referredUserId,
        },
      })

      return getReferralWithRedemptions(referralId)
    })

    return referral
  } catch (error) {
    if (error instanceof ReferralAlreadyAppliedError) {
      throw error
    }
    console.error('Error adding referred user:', error)
    throw error
  }
}

// Get referral by slug
export async function getReferralBySlug(slug: string) {
  try {
    const referral = await prisma.referral.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        redemptions: {
          select: {
            referredUserId: true,
          },
        },
      },
    })

    return referral
  } catch (error) {
    console.error('Error getting referral by slug:', error)
    return null
  }
}

// Get referral tier based on count
export async function getReferralTier(count: number): Promise<ReferralTier> {
  if (count >= 5) {
    return {
      level: 3,
      reward: '50% discount',
      count: 5,
    }
  } else if (count >= 3) {
    return {
      level: 2,
      reward: 'Free team creation',
      count: 3,
    }
  } else if (count >= 1) {
    return {
      level: 1,
      reward: '10% discount code',
      count: 1,
    }
  } else {
    return {
      level: 0,
      reward: 'No reward yet',
      count: 0,
    }
  }
}

// Get next tier information
export async function getNextTier(count: number): Promise<{ count: number; reward: string } | null> {
  if (count >= 5) {
    return null // Already at max tier
  } else if (count >= 3) {
    return {
      count: 5,
      reward: '50% discount',
    }
  } else if (count >= 1) {
    return {
      count: 3,
      reward: 'Free team creation',
    }
  } else {
    return {
      count: 1,
      reward: '10% discount code',
    }
  }
}
