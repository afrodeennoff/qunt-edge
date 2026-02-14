'use server'

import { Trade as PrismaTrade, Prisma } from '@/prisma/generated/prisma'
import { Trade as NormalizedTrade } from '@/lib/data-types'
import { revalidatePath, revalidateTag, updateTag, unstable_cache } from 'next/cache'
import { getDatabaseUserId, getUserId } from './auth'
import { isAfter } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { formatTimestamp, isChronologicalRange, normalizeToUtcTimestamp } from '@/lib/date-utils'
import { v5 as uuidv5 } from 'uuid'
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

export async function resolveWritableUserId(rawUserId: string): Promise<string> {
  const byId = await prisma.user.findUnique({
    where: { id: rawUserId },
    select: { id: true },
  })
  if (byId?.id) return byId.id

  const byAuthId = await prisma.user.findUnique({
    where: { auth_user_id: rawUserId },
    select: { id: true },
  })
  if (byAuthId?.id) return byAuthId.id

  throw new Error('Unable to resolve writable user')
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
  const currentUserId = await resolveWritableUserId(userId || await getUserId())
  if (!currentUserId) throw new Error('User not found')

  const tag = `trades-${currentUserId}`

  if (forceRefresh) {
    updateTag(tag)
  }

  const getCachedTrades = unstable_cache(
    async (uid: string, p: number, ps: number) => {
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
      revalidate: 3600
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

export async function addTagToTrade(tradeId: string, tag: string) {
  const userId = await getDatabaseUserId()
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId },
      select: { tags: true }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        tags: {
          push: tag.trim()
        }
      }
    })

    revalidatePath('/')
    return updatedTrade
  } catch (error) {
    console.error('Failed to add tag:', error)
    throw error
  }
}

export async function removeTagFromTrade(tradeId: string, tagToRemove: string) {
  const userId = await getDatabaseUserId()
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId },
      select: { tags: true }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        tags: {
          set: trade.tags.filter(tag => tag !== tagToRemove)
        }
      }
    })

    revalidatePath('/')
    return updatedTrade
  } catch (error) {
    console.error('Failed to remove tag:', error)
    throw error
  }
}

export async function deleteTagFromAllTrades(tag: string) {
  const userId = await getDatabaseUserId()
  try {
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        tags: {
          has: tag
        }
      }
    })

    await Promise.all(
      trades.map(trade =>
        prisma.trade.update({
          where: { id: trade.id },
          data: {
            tags: {
              set: trade.tags.filter(t => t !== tag)
            }
          }
        })
      )
    )

    revalidateTag(userId, { expire: 0 })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete tag:', error)
    throw error
  }
}

export async function updateTradeImage(
  tradeIds: string[],
  imageData: string | null,
  field: 'imageBase64' | 'imageBase64Second' = 'imageBase64'
) {
  const userId = await getDatabaseUserId()
  try {
    const trades = await prisma.trade.findMany({
      where: { id: { in: tradeIds }, userId }
    })

    if (trades.length !== tradeIds.length) {
      throw new Error('Some trades not found')
    }

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: {
        [field]: imageData
      }
    })

    revalidatePath('/')
    return trades
  } catch (error) {
    console.error('Failed to update trade image:', error)
    throw error
  }
}

export async function addTagsToTradesForDay(date: string, tags: string[]) {
  const userId = await getDatabaseUserId()
  try {
    const targetDate = new Date(date + 'T00:00:00Z')
    const nextDay = new Date(targetDate)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    const trades = await prisma.trade.findMany({
      where: {
        userId,
        OR: [
          {
            entryDate: {
              gte: date,
              lt: nextDayStr
            }
          },
          {
            closeDate: {
              gte: date,
              lt: nextDayStr
            }
          }
        ]
      }
    })

    await Promise.all(
      trades.map(trade =>
        prisma.trade.update({
          where: { id: trade.id },
          data: {
            tags: {
              set: Array.from(new Set([...trade.tags, ...tags]))
            }
          }
        })
      )
    )

    revalidatePath('/')
    return { success: true, tradesUpdated: trades.length }
  } catch (error) {
    console.error('Failed to add tags to trades for day:', error)
    throw error
  }
}
