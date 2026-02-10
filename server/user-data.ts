'use server'

import { getShared } from './shared'
import { TickDetails, User, Tag, DashboardLayout, FinancialEvent, Mood, Subscription, Account, Group } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'
import { GroupWithAccounts } from './groups'
import { getCurrentLocale } from '@/locales/server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId, getUserId } from './auth'
import { revalidateTag, unstable_cache } from 'next/cache'

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
    console.log(`[getUserData] Force refresh - bypassing cache for user ${userId}`)
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

    console.log(`[getUserData] Force refresh completed in ${(performance.now() - start).toFixed(2)}ms`)

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

  // Cache only lightweight, stable core data. Heavy/volatile data is fetched outside cache.
  // TIER 1: Global Stable Data (Tick details)
  const getGlobalTickDetails = unstable_cache(
    async () => prisma.tickDetails.findMany(),
    ['global-tick-details'],
    { revalidate: 86400, tags: ['global-tick-details'] }
  )

  // TIER 2: Global Localized Data (Financial events)
  const getGlobalFinancialEvents = unstable_cache(
    async (lang: string) => prisma.financialEvent.findMany({ where: { lang } }),
    [`global-financial-events-${locale}`],
    { revalidate: 3600, tags: [`global-financial-events-${locale}`] }
  )

  // TIER 3: User Core Data (Subscription, User profile)
  const getCachedCoreUserData = unstable_cache(
    async () => {
      const start = performance.now();
      console.log(`[Cache MISS] Fetching core user data for user ${userId}`)

      const [userData, subscription] = await Promise.all([
        prisma.user.findUnique({
          where: { auth_user_id: authUserId }
        }),
        prisma.subscription.findUnique({
          where: { userId: userId }
        })
      ])

      console.log(`[getUserData] Core data fetch completed in ${(performance.now() - start).toFixed(2)}ms`)
      return { userData, subscription }
    },
    [`user-data-core-${userId}`],
    {
      tags: [`user-data-${userId}`, `user-data-core-${userId}`],
      revalidate: 3600 // 1 hour
    }
  )

  // Fetch all in parallel
  const [core, tickDetails, financialEvents, accounts, groups, tags, moodHistory] = await Promise.all([
    getCachedCoreUserData(),
    getGlobalTickDetails(),
    getGlobalFinancialEvents(locale),
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

  return {
    userData: core.userData,
    subscription: core.subscription,
    tickDetails,
    tags,
    accounts,
    groups,
    financialEvents,
    moodHistory
  }
}

export async function getDashboardLayout(userId: string): Promise<DashboardLayout | null> {
  console.log('getDashboardLayout')
  try {
    const layout = await prisma.dashboardLayout.findUnique({
      where: {
        userId: userId  // Correct, as DashboardLayout.userId is linked to auth_user_id
      }
    })

    if (!layout) return null

    // Helper to ensure we return a parsed object/array, not a string
    const parseIfNeeded = (val: any) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch (e) {
          console.error('Failed to parse dashboard JSON', e)
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
    console.error('Error fetching dashboard layout:', error)
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
