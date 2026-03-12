'use server'

import { getShared } from './shared'
import { TickDetails, User, Tag, DashboardLayout, FinancialEvent, Mood, Subscription, Account, Group } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'
import { GroupWithAccounts } from './groups'
import { getCurrentLocale } from '@/locales/server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId, getUserId } from './auth'
import { revalidateTag, unstable_cache } from 'next/cache'
import { logger } from '@/lib/logger'
import { cacheQuery } from '@/lib/cache/query-cache'
import { FEATURE_FLAGS } from '@/lib/feature-flags'

export type SharedDataResponse = {
  trades: Trade[]
  params: any
  error?: string
  groups: GroupWithAccounts[]
}

export async function loadSharedData(slug: string): Promise<SharedDataResponse> {
  if (!slug) {
    return {
      trades: [],
      params: null,
      error: 'Invalid slug',
      groups: []
    }
  }

  try {
    const sharedData = await getShared(slug)
    if (!sharedData) {
      return {
        trades: [],
        params: null,
        error: 'Shared data not found',
        groups: []
      }
    }

    return {
      trades: sharedData.trades,
      params: sharedData.params,
      groups: []
    }
  } catch (error) {
    return {
      trades: [],
      params: null,
      error: 'Failed to load shared data',
      groups: []
    }
  }
}


export async function getUserData(forceRefresh: boolean = false): Promise<{
  userData: User | null;
  subscription: Subscription | null;
  tickDetails: TickDetails[];
  tags: Tag[];
  accounts: Account[];
  groups: Group[];
  financialEvents: FinancialEvent[];
  moodHistory: Mood[];
}> {
  const authUserId = await getUserId()
  const userId = await getDatabaseUserId()
  const locale = await getCurrentLocale()

  // If forceRefresh is true, bypass cache and fetch directly
  if (forceRefresh) {
    const start = performance.now();
    logger.info('[getUserData] Force refresh requested', { userId })
    revalidateTag(`user-data-${userId}`, { expire: 0 })

    // Fetch data in parallel without transaction to avoid timeouts
    const [userData, subscription, tickDetails, accounts, groups, tags, financialEvents, moodHistory] = await Promise.all([
      prisma.user.findUnique({
        where: { auth_user_id: authUserId }
      }),
      prisma.subscription.findUnique({
        where: { userId: userId }
      }),
      prisma.tickDetails.findMany(),
      prisma.account.findMany({
        where: { userId: userId },
        include: {
          payouts: true,
          group: true
        }
      }),
      prisma.group.findMany({
        where: { userId: userId },
        include: { accounts: true }
      }),
      prisma.tag.findMany({
        where: { userId: userId }
      }),
      prisma.financialEvent.findMany({
        where: { lang: locale }
      }),
      prisma.mood.findMany({
        where: { userId: userId }
      })
    ])

    logger.info('[getUserData] Force refresh completed', {
      userId,
      durationMs: Number((performance.now() - start).toFixed(2)),
    })

    return {
      userData,
      subscription,
      tickDetails,
      tags,
      accounts,
      groups,
      financialEvents,
      moodHistory
    }
  }

  // Use cacheQuery wrapper with feature flag support
  const shouldCache = FEATURE_FLAGS.ENABLE_QUERY_CACHING

  // TIER 1: Global Stable Data (Tick details)
  const getGlobalTickDetails = cacheQuery(
    async () => prisma.tickDetails.findMany(),
    ['global-tick-details'],
    { revalidateIn: shouldCache ? 86400 : 0 }
  )

  // TIER 2: Global Localized Data (Financial events)
  const getGlobalFinancialEvents = cacheQuery(
    async () => prisma.financialEvent.findMany({ where: { lang: locale } }),
    [`global-financial-events-${locale}`],
    { revalidateIn: shouldCache ? 3600 : 0 }
  )

  // TIER 3: User Core Data (Subscription, User profile)
  const getCachedCoreUserData = cacheQuery(
    async () => {
      const [userData, subscription] = await Promise.all([
        prisma.user.findUnique({
          where: { auth_user_id: authUserId }
        }),
        prisma.subscription.findUnique({
          where: { userId: userId }
        })
      ])

      return { userData, subscription }
    },
    [`user-data-core-${userId}`],
    {
      revalidateIn: shouldCache ? 3600 : 0,
      tags: [`user-data-${userId}`, `user-data-core-${userId}`]
    }
  )

  // TIER 4: User Supplemental Data (Accounts, Groups, Tags) - Cached because these don't change every second
  const getCachedSupplementalData = cacheQuery(
    async () => {
      const [accounts, groups, tags, moodHistory] = await Promise.all([
        prisma.account.findMany({
          where: { userId: userId },
          include: {
            payouts: true,
            group: true
          }
        }),
        prisma.group.findMany({
          where: { userId: userId },
          include: { accounts: true }
        }),
        prisma.tag.findMany({
          where: { userId: userId }
        }),
        prisma.mood.findMany({
          where: { userId: userId }
        })
      ])

      return { accounts, groups, tags, moodHistory }
    },
    [`user-data-supplemental-${userId}`],
    {
      revalidateIn: shouldCache ? 300 : 0,
      tags: [`user-data-${userId}`, `user-data-supplemental-${userId}`]
    }
  )

  // Fetch all in parallel
  const [core, tickDetails, financialEvents, supplemental] = await Promise.all([
    getCachedCoreUserData(),
    getGlobalTickDetails(),
    getGlobalFinancialEvents(),
    getCachedSupplementalData()
  ])

  return {
    userData: core.userData,
    subscription: core.subscription,
    tickDetails,
    tags: supplemental.tags,
    accounts: supplemental.accounts,
    groups: supplemental.groups,
    financialEvents,
    moodHistory: supplemental.moodHistory
  }
}

export async function getDashboardLayout(userId: string): Promise<DashboardLayout | null> {
  const getCachedDashboardLayout = unstable_cache(
    async () => prisma.dashboardLayout.findUnique({ where: { userId } }),
    [`dashboard-layout-${userId}`],
    {
      tags: [`dashboard-layout-${userId}`, `dashboard-${userId}`],
      revalidate: 120,
    }
  )

  try {
    const layout = await getCachedDashboardLayout()

    if (!layout) return null

    // Helper to ensure we return a parsed object/array, not a string
    const parseIfNeeded = (val: any) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch (e) {
          logger.error('[getDashboardLayout] Failed to parse dashboard JSON', { error: e, userId })
          return []
        }
      }
      return val
    }

    return {
      ...layout,
      desktop: parseIfNeeded(layout.desktop),
      mobile: parseIfNeeded(layout.mobile)
    }
  } catch (error) {
    logger.error('[getDashboardLayout] Error fetching dashboard layout', { error, userId })
    return null
  }
}

export async function updateIsFirstConnectionAction(isFirstConnection: boolean) {
  const authUserId = await getUserId()
  const userId = await getDatabaseUserId()
  if (!authUserId || !userId) {
    return 0
  }
  await prisma.user.update({
    where: { auth_user_id: authUserId },
    data: { isFirstConnection }
  })
  revalidateTag(`user-data-${userId}`, { expire: 0 })
}
