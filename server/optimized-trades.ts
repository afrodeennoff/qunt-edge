'use server'

import { prisma } from '@/lib/prisma'
import { executeOptimizedQuery } from '@/lib/query-optimizer'

export async function getOptimizedTradesForUser(userId: string, filters?: {
  accountNumbers?: string[]
  instruments?: string[]
  dateRange?: { from: string; to: string }
  limit?: number
}) {
  const cacheKey = `trades-${userId}-${JSON.stringify(filters)}`
  
  return executeOptimizedQuery(
    'getTradesForUser',
    async () => {
      const where: any = { userId }
      
      if (filters?.accountNumbers?.length) {
        where.accountNumber = { in: filters.accountNumbers }
      }
      
      if (filters?.instruments?.length) {
        where.instrument = { in: filters.instruments }
      }
      
      if (filters?.dateRange?.from || filters?.dateRange?.to) {
        where.entryDate = {}
        if (filters.dateRange.from) where.entryDate.gte = filters.dateRange.from
        if (filters.dateRange.to) where.entryDate.lte = filters.dateRange.to
      }
      
      return prisma.trade.findMany({
        where,
        select: {
          id: true,
          accountNumber: true,
          instrument: true,
          entryDate: true,
          closeDate: true,
          entryPrice: true,
          closePrice: true,
          quantity: true,
          side: true,
          pnl: true,
          commission: true,
          timeInPosition: true,
          tags: true,
          comment: true,
        },
        orderBy: { entryDate: 'desc' },
        take: filters?.limit || 1000,
      })
    },
    cacheKey,
    300 // 5 minute cache
  )
}

export async function getTradesByAccountOptimized(accountNumber: string, userId: string) {
  return executeOptimizedQuery(
    'getTradesByAccount',
    () => prisma.trade.findMany({
      where: {
        accountNumber,
        userId,
      },
      select: {
        id: true,
        instrument: true,
        entryDate: true,
        closeDate: true,
        pnl: true,
        commission: true,
        tags: true,
      },
      orderBy: { entryDate: 'desc' },
    }),
    `trades-account-${accountNumber}`,
    600 // 10 minute cache
  )
}

export async function getTradeCountByInstrument(userId: string) {
  return executeOptimizedQuery(
    'getTradeCountByInstrument',
    () => prisma.trade.groupBy({
      by: ['instrument'],
      where: { userId },
      _count: { id: true },
      _sum: { pnl: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    `trade-counts-${userId}`,
    1800 // 30 minute cache
  )
}

export async function getDailyPnLOptimized(userId: string, accountNumbers?: string[]) {
  return executeOptimizedQuery(
    'getDailyPnL',
    () => prisma.$queryRaw`
      SELECT 
        DATE(entry_date) as date,
        SUM(pnl - commission) as net_pnl,
        COUNT(*) as trade_count
      FROM "Trade"
      WHERE user_id = ${userId}
        ${accountNumbers && accountNumbers.length > 0 
          ? prisma.$queryRaw`AND account_number = ANY(${accountNumbers})` 
          : prisma.$queryRaw``}
      GROUP BY DATE(entry_date)
      ORDER BY date DESC
      LIMIT 365
    `,
    `daily-pnl-${userId}`,
    300 // 5 minute cache
  )
}

export async function getAccountSummaryOptimized(userId: string) {
  return executeOptimizedQuery(
    'getAccountSummary',
    async () => {
      const accounts = await prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          number: true,
          startingBalance: true,
          propfirm: true,
          payoutCount: true,
        },
      })
      
      const accountNumbers = accounts.map(a => a.number)
      
      const tradeStats = await prisma.trade.groupBy({
        by: ['accountNumber'],
        where: {
          userId,
          accountNumber: { in: accountNumbers },
        },
        _count: { id: true },
        _sum: { pnl: true, commission: true },
      })
      
      return accounts.map(account => {
        const stats = tradeStats.find(s => s.accountNumber === account.number)
        return {
          ...account,
          tradeCount: stats?._count.id || 0,
          totalPnL: stats?._sum.pnl || 0,
          totalCommission: stats?._sum.commission || 0,
        }
      })
    },
    `account-summary-${userId}`,
    600 // 10 minute cache
  )
}

export async function batchUpdateTradesOptimized(updates: Array<{ id: string; data: any }>) {
  return prisma.$transaction(
    updates.map(update =>
      prisma.trade.update({
        where: { id: update.id },
        data: update.data,
      })
    )
  )
}

export async function getRecentTradesWithPagination(
  userId: string,
  page: number = 1,
  pageSize: number = 50
) {
  const skip = (page - 1) * pageSize
  
  return executeOptimizedQuery(
    'getRecentTradesPaginated',
    async () => {
      const [trades, totalCount] = await Promise.all([
        prisma.trade.findMany({
          where: { userId },
          select: {
            id: true,
            accountNumber: true,
            instrument: true,
            entryDate: true,
            pnl: true,
            commission: true,
            tags: true,
          },
          orderBy: { entryDate: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.trade.count({ where: { userId } }),
      ])
      
      return {
        trades,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      }
    },
    `trades-page-${userId}-${page}`,
    120 // 2 minute cache
  )
}
