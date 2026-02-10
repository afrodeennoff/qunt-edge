'use server'
import { Trade as PrismaTrade, Prisma, DashboardLayout, User, Subscription, Tag, Account, Group, FinancialEvent, Mood, TickDetails } from '@/prisma/generated/prisma'
import { Trade as NormalizedTrade } from '@/lib/data-types'
import { revalidatePath, updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { Widget, Layouts } from '@/app/[locale]/dashboard/types/dashboard'
import { createClient, getUserId } from './auth'
import { isAfter } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { defaultLayouts } from '@/lib/default-layouts'
import { formatTimestamp, isChronologicalRange, normalizeToUtcTimestamp } from '@/lib/date-utils'
import { v5 as uuidv5 } from 'uuid'
// Removed Decimal import from @prisma/client-runtime-utils
import { logger } from '@/lib/logger'
import { z } from 'zod'

const importTradeSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  instrument: z.string().min(1, 'Instrument is required'),
  side: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform(v => v.toString()),
  entryPrice: z.union([z.string(), z.number()]).transform(v => v.toString()),
  closePrice: z.union([z.string(), z.number()]).transform(v => v.toString()),
  pnl: z.union([z.string(), z.number()]).transform(v => v.toString()),
  commission: z.union([z.string(), z.number()]).default('0').transform(v => v.toString()),
  entryDate: z.string().transform((value, ctx) => {
    try {
      return normalizeToUtcTimestamp(value)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid entry date' })
      return z.NEVER
    }
  }),
  closeDate: z.string().transform((value, ctx) => {
    try {
      return normalizeToUtcTimestamp(value)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid close date' })
      return z.NEVER
    }
  }),
  timeInPosition: z.union([z.string(), z.number()]).optional().transform(v => v?.toString()),
  entryId: z.string().optional(),
  closeId: z.string().optional(),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
  groupId: z.string().nullish(),
}).refine((trade) => isChronologicalRange(trade.entryDate, trade.closeDate), {
  path: ['closeDate'],
  message: 'Close date must be equal to or later than entry date',
})

type TradeError =
  | 'DUPLICATE_TRADES'
  | 'NO_TRADES_ADDED'
  | 'DATABASE_ERROR'
  | 'INVALID_DATA'

interface TradeResponse {
  error: TradeError | false
  numberOfTradesAdded: number
  details?: unknown
}

export type SerializedTrade = Omit<PrismaTrade, 'entryPrice' | 'closePrice' | 'pnl' | 'commission' | 'quantity' | 'timeInPosition' | 'entryDate' | 'closeDate'> & {
  entryPrice: string
  closePrice: string
  pnl: string
  commission: string
  quantity: string
  timeInPosition: string
  entryDate: string
  closeDate: string | null
}

export interface PaginatedTrades {
  trades: SerializedTrade[]
  metadata: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
}

interface SaveLayoutResult {
  success: boolean
  error?: string
}

const saveLocks = new Map<string, Promise<SaveLayoutResult>>()

function validateLayouts(layouts: DashboardLayout): boolean {
  if (!layouts || typeof layouts !== 'object') return false

  const validateArray = (arr: unknown): arr is Prisma.JsonArray => {
    if (!Array.isArray(arr)) return false
    return arr.every(item =>
      item &&
      typeof item === 'object' &&
      'i' in item &&
      'type' in item &&
      'x' in item &&
      'y' in item &&
      'w' in item &&
      'h' in item
    )
  }

  return validateArray(layouts.desktop) && validateArray(layouts.mobile)
}

function serializeTrade(trade: any): SerializedTrade {
  return {
    ...trade,
    entryPrice: trade.entryPrice?.toString() || "0",
    closePrice: trade.closePrice?.toString() || "0",
    pnl: trade.pnl?.toString() || "0",
    commission: trade.commission?.toString() || "0",
    quantity: trade.quantity?.toString() || "0",
    timeInPosition: trade.timeInPosition?.toString() || "0",
    entryDate: trade.entryDate instanceof Date ? trade.entryDate.toISOString() : new Date(trade.entryDate).toISOString(),
    closeDate: trade.closeDate ? (trade.closeDate instanceof Date ? trade.closeDate.toISOString() : new Date(trade.closeDate).toISOString()) : null,
  } as SerializedTrade
}

export async function revalidateCache(tags: string[]) {
  logger.info(`[revalidateCache] Starting cache invalidation`, { tags })
  tags.forEach(tag => {
    try {
      updateTag(tag)
    } catch (error) {
      logger.error(`[revalidateCache] Error revalidating tag ${tag}`, { error })
    }
  })
}

const TRADE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

async function resolveWritableUserId(rawUserId: string): Promise<string> {
  // Fast path: userId is already the primary key used by Account/Trade relations.
  const byId = await prisma.user.findUnique({
    where: { id: rawUserId },
    select: { id: true },
  })
  if (byId?.id) return byId.id

  // Legacy path: some records may still be keyed by auth_user_id with a different id.
  const byAuthId = await prisma.user.findUnique({
    where: { auth_user_id: rawUserId },
    select: { id: true },
  })
  if (byAuthId?.id) return byAuthId.id

  // No user row yet: create one deterministically so FK writes don't fail.
  const headersList = await headers()
  const emailFromHeader = headersList.get('x-user-email')?.trim().toLowerCase() || ''
  let resolvedEmail = emailFromHeader

  if (!resolvedEmail) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    resolvedEmail = user?.email?.trim().toLowerCase() || ''
  }

  // Last-resort deterministic fallback to keep imports from failing due to missing email context.
  if (!resolvedEmail) {
    resolvedEmail = `${rawUserId}@users.qunt-edge.local`
  }

  const created = await prisma.user.upsert({
    where: { id: rawUserId },
    create: {
      id: rawUserId,
      auth_user_id: rawUserId,
      email: resolvedEmail,
    },
    update: {},
    select: { id: true },
  })

  return created.id
}

function generateTradeUUID(trade: Partial<PrismaTrade> | any): string {
  const tradeSignature = [
    trade.userId || '',
    trade.accountNumber || '',
    trade.instrument || '',
    trade.entryDate instanceof Date ? trade.entryDate.toISOString() : (trade.entryDate || ''),
    trade.closeDate instanceof Date ? trade.closeDate.toISOString() : (trade.closeDate || ''),
    trade.entryPrice?.toString() || '',
    trade.closePrice?.toString() || '',
    (trade.quantity || 0).toString(),
    trade.entryId || '',
    trade.closeId || '',
    (trade.timeInPosition || 0).toString(),
    trade.side || '',
    trade.pnl?.toString() || '',
    trade.commission?.toString() || '',
  ].join('|')

  return uuidv5(tradeSignature, TRADE_NAMESPACE)
}

export async function saveTradesAction(
  data: any[],
  options?: { userId?: string }
): Promise<TradeResponse> {
  const rawUserId = options?.userId ?? await getUserId()
  const userId = await resolveWritableUserId(rawUserId)
  logger.info(`[saveTrades] Saving trades`, { count: data.length, userId, rawUserId })

  if (!Array.isArray(data) || data.length === 0) {
    return { error: 'INVALID_DATA', numberOfTradesAdded: 0, details: 'No trades provided' }
  }

  try {
    const now = new Date()
    const userAssignedTrades: any[] = []
    const validationErrors: string[] = []

    for (const rawTrade of data) {
      const validation = importTradeSchema.safeParse(rawTrade)

      if (!validation.success) {
        validationErrors.push(`Validation failed for trade ${rawTrade.instrument}: ${validation.error.message}`)
        continue
      }

      const trade = validation.data

      // Future date check
      if (isAfter(new Date(trade.entryDate), now)) {
        validationErrors.push(`Trade ${trade.instrument} has a future entry date`)
        continue
      }
      if (isAfter(new Date(trade.closeDate), now)) {
        validationErrors.push(`Trade ${trade.instrument} has a future close date`)
        continue
      }

      userAssignedTrades.push({
        ...trade,
        userId: userId,
        accountNumber: trade.accountNumber.trim(),
        entryPrice: new Prisma.Decimal(trade.entryPrice),
        closePrice: new Prisma.Decimal(trade.closePrice),
        pnl: new Prisma.Decimal(trade.pnl),
        commission: new Prisma.Decimal(trade.commission || '0'),
        quantity: new Prisma.Decimal(trade.quantity),
        timeInPosition: new Prisma.Decimal(trade.timeInPosition || '0'),
        entryDate: new Date(trade.entryDate),
        closeDate: new Date(trade.closeDate),
        id: generateTradeUUID({ ...trade, userId: userId }),
      })
    }

    if (validationErrors.length > 0 && userAssignedTrades.length === 0) {
      return {
        error: 'INVALID_DATA',
        numberOfTradesAdded: 0,
        details: validationErrors.join('; ')
      }
    }

    const missingAccountNumberTrades = userAssignedTrades.filter(
      trade => !trade.accountNumber || trade.accountNumber.length === 0
    )
    if (missingAccountNumberTrades.length > 0) {
      return {
        error: 'INVALID_DATA',
        numberOfTradesAdded: 0,
        details: 'One or more trades are missing account numbers'
      }
    }

    const uniqueAccountNumbers = Array.from(
      new Set(userAssignedTrades.map(trade => trade.accountNumber))
    )

    const result = await prisma.$transaction(async tx => {
      const existingAccounts = await tx.account.findMany({
        where: {
          userId,
          number: { in: uniqueAccountNumbers }
        },
        select: { number: true }
      })

      const existingAccountNumbers = new Set(existingAccounts.map(account => account.number))
      const missingAccountNumbers = uniqueAccountNumbers.filter(
        accountNumber => !existingAccountNumbers.has(accountNumber)
      )

      if (missingAccountNumbers.length > 0) {
        logger.info('[saveTrades] Creating missing accounts for imported trades', {
          userId,
          count: missingAccountNumbers.length
        })
        await tx.account.createMany({
          data: missingAccountNumbers.map(accountNumber => ({
            number: accountNumber,
            userId
          })),
          skipDuplicates: true
        })
      }

      return tx.trade.createMany({
        data: userAssignedTrades,
        skipDuplicates: true
      })
    })

    updateTag(`trades-${userId}`)
    updateTag(`user-data-${userId}`)

    if (result.count === 0) {
      logger.info('[saveTrades] No trades added. Duplicate check.')
      return {
        error: 'DUPLICATE_TRADES',
        numberOfTradesAdded: 0
      }
    }

    return { error: false, numberOfTradesAdded: result.count }
  } catch (error) {
    logger.error('[saveTrades] Database error', { error })
    return {
      error: 'DATABASE_ERROR',
      numberOfTradesAdded: 0,
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getTradesAction(
  userId: string | null = null,
  page: number = 1,
  pageSize: number = 50,
  forceRefresh: boolean = false
): Promise<PaginatedTrades> {
  const currentUserId = userId || await resolveWritableUserId(await getUserId())
  if (!currentUserId) throw new Error('User not found')

  const tag = `trades-${currentUserId}`

  if (forceRefresh) {
    updateTag(tag)
  }

  const getCachedTrades = unstable_cache(
    async (uid: string, p: number, ps: number) => {
      console.log(`[Cache MISS] Fetching trades for user ${uid}, page ${p}`)
      const where: Prisma.TradeWhereInput = { userId: uid }

      const [trades, total] = await Promise.all([
        prisma.trade.findMany({
          where,
          orderBy: { entryDate: 'desc' },
          skip: (p - 1) * ps,
          take: ps,
          select: {
            id: true,
            accountNumber: true,
            instrument: true,
            side: true,
            quantity: true,
            entryPrice: true,
            closePrice: true,
            pnl: true,
            commission: true,
            entryDate: true,
            closeDate: true,
            timeInPosition: true,
            comment: true,
            tags: true,
            groupId: true,
            userId: true,
            videoUrl: true,
            createdAt: true,
          }
        }),
        prisma.trade.count({ where })
      ])

      const totalPages = Math.ceil(total / ps)

      return {
        trades: trades.map(serializeTrade),
        metadata: {
          total,
          page: p,
          totalPages,
          hasMore: p < totalPages
        }
      }
    },
    [`trades-${currentUserId}-page-${page}-size-${pageSize}`],
    {
      tags: [tag, `trades-${currentUserId}`],
      revalidate: 3600 // 1 hour
    }
  )

  try {
    return await getCachedTrades(currentUserId, page, pageSize)
  } catch (error) {
    logger.error('getTradesAction failed', { error })
    throw error
  }
}

export async function getTradeImagesAction(tradeId: string): Promise<{
  imageBase64: string | null;
  imageBase64Second: string | null;
} | null> {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) return null

  try {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId, userId },
      select: {
        imageBase64: true,
        imageBase64Second: true,
      }
    })
    return trade
  } catch (error) {
    logger.error('[getTradeImagesAction] Error', { error, tradeId })
    return null
  }
}

export async function updateTradesAction(tradesIds: string[], update: Partial<NormalizedTrade> & {
  entryDateOffset?: number
  closeDateOffset?: number
  instrumentTrim?: { fromStart: number; fromEnd: number }
  instrumentPrefix?: string
  instrumentSuffix?: string
}): Promise<number> {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) return 0

  try {
    if (update.entryDateOffset || update.closeDateOffset || update.instrumentTrim || update.instrumentPrefix || update.instrumentSuffix) {
      const trades = await prisma.trade.findMany({
        where: { id: { in: tradesIds }, userId },
        select: { id: true, entryDate: true, closeDate: true, instrument: true }
      })

      await Promise.all(trades.map(async (trade) => {
        const data: any = {}

        if (update.entryDateOffset) {
          const d = new Date(trade.entryDate)
          d.setHours(d.getHours() + update.entryDateOffset)
          data.entryDate = formatTimestamp(d.toISOString())
        }
        if (update.closeDateOffset && trade.closeDate) {
          const d = new Date(trade.closeDate)
          d.setHours(d.getHours() + update.closeDateOffset)
          data.closeDate = formatTimestamp(d.toISOString())
        }

        let newInst = trade.instrument
        if (update.instrumentTrim) {
          newInst = newInst.substring(update.instrumentTrim.fromStart, newInst.length - update.instrumentTrim.fromEnd)
        }
        if (update.instrumentPrefix) newInst = update.instrumentPrefix + newInst
        if (update.instrumentSuffix) newInst = newInst + update.instrumentSuffix

        if (newInst !== trade.instrument) data.instrument = newInst

        if (Object.keys(data).length > 0) {
          await prisma.trade.update({ where: { id: trade.id }, data })
        }
      }))
    }

    const {
      entryDateOffset, closeDateOffset, instrumentTrim, instrumentPrefix, instrumentSuffix,
      ...standardUpdates
    } = update

    if (Object.keys(standardUpdates).length > 0) {
      const data: any = { ...standardUpdates }
      if (standardUpdates.entryPrice !== undefined) data.entryPrice = new Prisma.Decimal(standardUpdates.entryPrice)
      if (standardUpdates.closePrice !== undefined) data.closePrice = standardUpdates.closePrice !== null ? new Prisma.Decimal(standardUpdates.closePrice) : null
      if (standardUpdates.pnl !== undefined) data.pnl = new Prisma.Decimal(standardUpdates.pnl)
      if (standardUpdates.commission !== undefined) data.commission = standardUpdates.commission !== null ? new Prisma.Decimal(standardUpdates.commission) : null
      if (standardUpdates.quantity !== undefined) data.quantity = new Prisma.Decimal(standardUpdates.quantity)
      if (standardUpdates.timeInPosition !== undefined) data.timeInPosition = standardUpdates.timeInPosition !== null ? new Prisma.Decimal(standardUpdates.timeInPosition) : null

      await prisma.trade.updateMany({
        where: { id: { in: tradesIds }, userId },
        data,
      })
    }

    updateTag(`trades-${userId}`)
    return tradesIds.length
  } catch (error) {
    logger.error('[updateTrades] Error', { error })
    return 0
  }
}

export async function updateTradeCommentAction(tradeId: string, comment: string | null) {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) {
    throw new Error('User not found')
  }

  try {
    await prisma.trade.update({
      where: { id: tradeId, userId },
      data: { comment }
    })
    revalidatePath('/')
  } catch (error) {
    logger.error("[updateTradeComment] Error", { error })
    throw error
  }
}

export async function updateTradeVideoUrlAction(tradeId: string, videoUrl: string | null) {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) {
    throw new Error('User not found')
  }

  try {
    await prisma.trade.update({
      where: { id: tradeId, userId },
      data: { videoUrl }
    })
    revalidatePath('/')
  } catch (error) {
    logger.error("[updateTradeVideoUrl] Error", { error })
    throw error
  }
}

export async function loadDashboardLayoutAction(): Promise<Layouts | null> {
  const userId = await getUserId()
  try {
    const dashboard = await prisma.dashboardLayout.findUnique({
      where: { userId },
    })

    if (!dashboard) return null

    const parse = (json: any): Widget[] => {
      if (Array.isArray(json)) return json as unknown as Widget[]
      return []
    }

    return {
      desktop: parse(dashboard.desktop),
      mobile: parse(dashboard.mobile)
    }
  } catch (error) {
    logger.error('[loadDashboardLayout] Error', { error })
    return null
  }
}

export async function saveDashboardLayoutAction(layouts: DashboardLayout): Promise<SaveLayoutResult> {
  const userId = await getUserId()
  const headersList = await headers()

  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }

  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }

  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayout] Validation failed', { userId })
    return { success: false, error: 'Invalid layout structure' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const emailFromHeader = headersList.get('x-user-email') || ''
    const resolvedEmail = user?.email || emailFromHeader

    if (!resolvedEmail) {
      logger.error('[saveDashboardLayout] Missing user email for ensureUserInDatabase', { userId })
      return { success: false, error: 'User email not available' }
    }

    await prisma.user.upsert({
      where: { auth_user_id: userId },
      create: {
        id: userId,
        auth_user_id: userId,
        email: resolvedEmail,
      },
      update: {
        email: resolvedEmail,
      },
    })
  } catch (error) {
    logger.error('[saveDashboardLayout] Failed to ensure user record', { error, userId })
    return { success: false, error: 'Failed to ensure user record' }
  }

  const verifiedUser = await prisma.user.findUnique({
    where: { auth_user_id: userId },
    select: { id: true },
  })

  if (!verifiedUser) {
    logger.error('[saveDashboardLayout] Missing user record for layout save', { userId })
    return { success: false, error: 'User record not found' }
  }

  const lockKey = `layout:${userId}`

  if (saveLocks.has(lockKey)) {
    logger.info('[saveDashboardLayout] Debouncing concurrent save', { userId })
    return { success: true }
  }

  const savePromise = (async (): Promise<SaveLayoutResult> => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.dashboardLayout.upsert({
          where: { userId },
          update: {
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray,
            updatedAt: new Date()
          },
          create: {
            userId,
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray
          },
        })
      })

      updateTag(`dashboard-${userId}`)
      revalidatePath('/')

      logger.info('[saveDashboardLayout] Success', { userId })
      return { success: true }
    } catch (error) {
      logger.error('[saveDashboardLayout] Error', { error, userId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    }
  })()

  saveLocks.set(lockKey, savePromise)

  try {
    const result = await savePromise
    return result
  } finally {
    saveLocks.delete(lockKey)
  }
}

export async function createDefaultDashboardLayout(userId: string): Promise<void> {
  try {
    const existing = await prisma.dashboardLayout.findUnique({ where: { userId } })
    if (existing) return

    await prisma.dashboardLayout.create({
      data: {
        userId,
        desktop: defaultLayouts.desktop as unknown as Prisma.JsonArray,
        mobile: defaultLayouts.mobile as unknown as Prisma.JsonArray
      }
    })
  } catch (error) {
    logger.warn('[createDefaultDashboardLayout] Failed (likely exists)', { error })
  }
}

export async function createLayoutVersionAction(
  layoutId: string,
  versionData: {
    desktop: unknown
    mobile: unknown
    version: number
    checksum: string
    description?: string
    deviceId: string
    changeType: string
  }
): Promise<void> {
  try {
    await prisma.layoutVersion.create({
      data: {
        layoutId,
        desktop: versionData.desktop as Prisma.JsonArray,
        mobile: versionData.mobile as Prisma.JsonArray,
        version: versionData.version,
        checksum: versionData.checksum,
        description: versionData.description,
        deviceId: versionData.deviceId,
        changeType: versionData.changeType
      }
    })

    await prisma.dashboardLayout.update({
      where: { id: layoutId },
      data: {
        version: versionData.version,
        checksum: versionData.checksum,
        deviceId: versionData.deviceId
      }
    })

    logger.info('[createLayoutVersion] Success', { layoutId, version: versionData.version })
  } catch (error) {
    logger.error('[createLayoutVersion] Error', { error, layoutId })
    throw error
  }
}

export async function getLayoutVersionHistoryAction(
  layoutId: string,
  limit = 20
): Promise<Array<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
}>> {
  try {
    const versions = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      take: limit
    })

    return versions.map(v => ({
      id: v.id,
      version: v.version,
      desktop: v.desktop,
      mobile: v.mobile,
      checksum: v.checksum,
      description: v.description ?? undefined,
      deviceId: v.deviceId,
      changeType: v.changeType,
      createdAt: v.createdAt
    }))
  } catch (error) {
    logger.error('[getLayoutVersionHistory] Error', { error, layoutId })
    return []
  }
}

export async function getLayoutVersionByNumberAction(
  layoutId: string,
  versionNumber: number
): Promise<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
} | null> {
  try {
    const version = await prisma.layoutVersion.findUnique({
      where: {
        id: await prisma.layoutVersion.findFirst({
          where: { layoutId, version: versionNumber },
          select: { id: true }
        }).then(v => v?.id)
      }
    })

    if (!version) return null

    return {
      id: version.id,
      version: version.version,
      desktop: version.desktop,
      mobile: version.mobile,
      checksum: version.checksum,
      description: version.description ?? undefined,
      deviceId: version.deviceId,
      changeType: version.changeType,
      createdAt: version.createdAt
    }
  } catch (error) {
    logger.error('[getLayoutVersionByNumber] Error', { error, layoutId, versionNumber })
    return null
  }
}

export async function cleanupOldLayoutVersionsAction(
  layoutId: string,
  keepCount = 50
): Promise<void> {
  try {
    const totalCount = await prisma.layoutVersion.count({ where: { layoutId } })

    if (totalCount <= keepCount) return

    const versionsToDelete = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      skip: keepCount,
      select: { id: true }
    })

    if (versionsToDelete.length === 0) return

    await prisma.layoutVersion.deleteMany({
      where: {
        id: { in: versionsToDelete.map(v => v.id) }
      }
    })

    logger.info('[cleanupOldLayoutVersions] Success', {
      layoutId,
      deletedCount: versionsToDelete.length
    })
  } catch (error) {
    logger.error('[cleanupOldLayoutVersions] Error', { error, layoutId })
  }
}

export async function saveDashboardLayoutWithVersionAction(
  layouts: DashboardLayout,
  versionData: {
    description?: string
    changeType: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
    deviceId: string
  }
): Promise<SaveLayoutResult> {
  const userId = await getUserId()

  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }

  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }

  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayoutWithVersion] Validation failed', { userId })
    return { success: false, error: 'Invalid layout structure' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.dashboardLayout.findUnique({
        where: { userId },
        select: { id: true, version: true, checksum: true }
      })

      const newVersion = (existing?.version ?? 0) + 1

      const crypto = await import('crypto')
      const checksum = crypto.createHash('sha256')
        .update(JSON.stringify({ desktop: layouts.desktop, mobile: layouts.mobile }))
        .digest('hex')

      const savedLayout = await tx.dashboardLayout.upsert({
        where: { userId },
        update: {
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId,
          updatedAt: new Date()
        },
        create: {
          userId,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId
        },
      })

      await tx.layoutVersion.create({
        data: {
          layoutId: savedLayout.id,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          description: versionData.description,
          deviceId: versionData.deviceId,
          changeType: versionData.changeType
        }
      })
    })

    updateTag(`dashboard-${userId}`)
    revalidatePath('/')

    logger.info('[saveDashboardLayoutWithVersion] Success', { userId })
    return { success: true }
  } catch (error) {
    logger.error('[saveDashboardLayoutWithVersion] Error', { error, userId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

export async function groupTradesAction(tradeIds: string[]): Promise<boolean> {
  try {
    const userId = await resolveWritableUserId(await getUserId())
    const groupId = crypto.randomUUID()

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId }
    })

    revalidatePath('/')
    return true
  } catch (error) {
    logger.error('[groupTrades] Error', { error })
    return false
  }
}

export async function ungroupTradesAction(tradeIds: string[]): Promise<boolean> {
  try {
    const userId = await resolveWritableUserId(await getUserId())
    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId: "" }
    })

    revalidatePath('/')
    return true
  } catch (error) {
    logger.error('[ungroupTrades] Error', { error })
    return false
  }
}
