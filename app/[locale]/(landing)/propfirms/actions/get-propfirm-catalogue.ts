'use server'

import { prisma } from '@/lib/prisma'
import type { PropfirmCatalogueData, PropfirmCatalogueStats, PropfirmPayoutStats } from './types'
import type { Timeframe } from './timeframe-utils'
import { getTimeframeDateRange } from './timeframe-utils'

// Raw SQL query result type for payout aggregation
interface PayoutAggregationResult {
  propfirm: string;
  status: string;
  total_amount: number;
  count: number;
}

// Raw SQL query result type for account count
interface AccountCountResult {
  propfirm: string;
  count: number;
  total_account_value: number;
}

interface AccountSizeDistributionResult {
  propfirm: string;
  starting_balance: number;
  count: number;
  total_value: number;
}

function formatAccountSizeLabel(balance: number): string {
  if (!Number.isFinite(balance) || balance <= 0) {
    return 'Unknown'
  }
  if (balance >= 1_000_000) {
    const millions = balance / 1_000_000
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`
  }
  if (balance >= 1_000) {
    const thousands = balance / 1_000
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`
  }
  return balance.toLocaleString('en-US')
}

function formatSizeBreakdown(
  rows: Array<{ starting_balance: number; count: number }>
): string {
  const visible = rows
    .filter((row) => row.starting_balance > 0 && row.count > 0)
    .sort((a, b) => b.count - a.count || b.starting_balance - a.starting_balance)
    .slice(0, 4)
    .map((row) => `${row.count}x${formatAccountSizeLabel(row.starting_balance)}`)

  return visible.length > 0 ? visible.join(' + ') : 'No sized accounts'
}

export async function getPropfirmCatalogueData(timeframe: Timeframe = 'currentMonth'): Promise<PropfirmCatalogueData> {
  if (process.env.NODE_ENV === 'development') {
    return {
      stats: [
        {
          propfirmName: 'Apex',
          accountsCount: 12,
          sizedAccountsCount: 12,
          totalAccountValue: 850000,
          sizeBreakdown: '6x50k + 4x100k + 2x75k',
          sizeDistribution: [
            { label: '50k', count: 6, totalValue: 300000 },
            { label: '100k', count: 4, totalValue: 400000 },
            { label: '75k', count: 2, totalValue: 150000 },
          ],
          payouts: {
            propfirmName: 'Apex',
            pendingAmount: 2500,
            pendingCount: 2,
            refusedAmount: 0,
            refusedCount: 0,
            paidAmount: 15400,
            paidCount: 8
          }
        },
        {
          propfirmName: 'Topstep',
          accountsCount: 5,
          sizedAccountsCount: 5,
          totalAccountValue: 250000,
          sizeBreakdown: '3x50k + 2x25k',
          sizeDistribution: [
            { label: '50k', count: 3, totalValue: 150000 },
            { label: '25k', count: 2, totalValue: 50000 },
          ],
          payouts: {
            propfirmName: 'Topstep',
            pendingAmount: 0,
            pendingCount: 0,
            refusedAmount: 0,
            refusedCount: 0,
            paidAmount: 8200,
            paidCount: 4
          }
        }
      ]
    }
  }

  try {
    const { startDate, endDate } = getTimeframeDateRange(timeframe)

    // Get account counts per propfirm (excluding empty propfirm strings)
    // Filter by createdAt within the timeframe
    const accountCounts = await prisma.$queryRaw<AccountCountResult[]>`
      SELECT 
        propfirm as propfirm,
        COUNT(*)::int as count,
        COALESCE(SUM("startingBalance"), 0)::float as total_account_value
      FROM "Account"
      WHERE propfirm IS NOT NULL 
        AND propfirm != ''
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY propfirm
      ORDER BY propfirm
    `

    const accountSizeDistribution = await prisma.$queryRaw<AccountSizeDistributionResult[]>`
      SELECT
        propfirm as propfirm,
        COALESCE("startingBalance", 0)::float as starting_balance,
        COUNT(*)::int as count,
        COALESCE(SUM("startingBalance"), 0)::float as total_value
      FROM "Account"
      WHERE propfirm IS NOT NULL
        AND propfirm != ''
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY propfirm, "startingBalance"
      ORDER BY propfirm, "startingBalance" DESC
    `

    // Get payout aggregations per propfirm and status
    // We need to join Payout -> Account to get the propfirm name
    // Filter payouts by date (payout date) within the timeframe
    const payoutAggregations = await prisma.$queryRaw<PayoutAggregationResult[]>`
      SELECT 
        a.propfirm as propfirm,
        p.status as status,
        COALESCE(SUM(p.amount), 0)::float as total_amount,
        COUNT(*)::int as count
      FROM "Payout" p
      INNER JOIN "Account" a ON p."accountId" = a.id
      WHERE a.propfirm IS NOT NULL 
        AND a.propfirm != ''
        AND p.date >= ${startDate}
        AND p.date <= ${endDate}
      GROUP BY a.propfirm, p.status
      ORDER BY a.propfirm, p.status
    `

    const sizeRowsByPropfirm = new Map<string, AccountSizeDistributionResult[]>()
    accountSizeDistribution.forEach((row) => {
      const existing = sizeRowsByPropfirm.get(row.propfirm) || []
      existing.push(row)
      sizeRowsByPropfirm.set(row.propfirm, existing)
    })

    // Build a map of propfirm -> payout stats
    const payoutStatsMap = new Map<string, PropfirmPayoutStats>()

    // Initialize payout stats for all propfirms found in accounts
    accountCounts.forEach((row: AccountCountResult) => {
      const { propfirm } = row
      if (!payoutStatsMap.has(propfirm)) {
        payoutStatsMap.set(propfirm, {
          propfirmName: propfirm,
          pendingAmount: 0,
          pendingCount: 0,
          refusedAmount: 0,
          refusedCount: 0,
          paidAmount: 0,
          paidCount: 0,
        })
      }
    })

    // Aggregate payout data by status
    payoutAggregations.forEach((row: PayoutAggregationResult) => {
      const { propfirm, status, total_amount, count } = row
      if (!payoutStatsMap.has(propfirm)) {
        payoutStatsMap.set(propfirm, {
          propfirmName: propfirm,
          pendingAmount: 0,
          pendingCount: 0,
          refusedAmount: 0,
          refusedCount: 0,
          paidAmount: 0,
          paidCount: 0,
        })
      }

      const stats = payoutStatsMap.get(propfirm)!

      if (status === 'PENDING') {
        stats.pendingAmount = Number(total_amount)
        stats.pendingCount = count
      } else if (status === 'REFUSED') {
        stats.refusedAmount = Number(total_amount)
        stats.refusedCount = count
      } else if (status === 'PAID' || status === 'VALIDATED') {
        // Combine PAID and VALIDATED as "paid"
        stats.paidAmount += Number(total_amount)
        stats.paidCount += count
      }
    })

    // Build final stats array combining account counts and payout stats
    const stats: PropfirmCatalogueStats[] = accountCounts.map((row: AccountCountResult) => {
      const { propfirm, count } = row
      const sizeRows = sizeRowsByPropfirm.get(propfirm) || []
      const payoutStats = payoutStatsMap.get(propfirm) || {
        propfirmName: propfirm,
        pendingAmount: 0,
        pendingCount: 0,
        refusedAmount: 0,
        refusedCount: 0,
        paidAmount: 0,
        paidCount: 0,
      }
      const sizedAccountsCount = sizeRows.reduce(
        (total, entry) => total + (entry.starting_balance > 0 ? entry.count : 0),
        0
      )
      const sizeDistribution = sizeRows
        .filter((entry) => entry.starting_balance > 0)
        .map((entry) => ({
          label: formatAccountSizeLabel(entry.starting_balance),
          count: entry.count,
          totalValue: Number(entry.total_value),
        }))
        .sort((a, b) => b.count - a.count || b.totalValue - a.totalValue)

      return {
        propfirmName: propfirm,
        accountsCount: count,
        sizedAccountsCount,
        totalAccountValue: Number(row.total_account_value),
        sizeBreakdown: formatSizeBreakdown(sizeRows),
        sizeDistribution,
        payouts: payoutStats,
      }
    })

    // Also include propfirms that have payouts but no accounts (edge case)
    payoutStatsMap.forEach((payoutStats, propfirm) => {
      const exists = stats.some(s => s.propfirmName === propfirm)
      if (!exists) {
        stats.push({
          propfirmName: propfirm,
          accountsCount: 0,
          sizedAccountsCount: 0,
          totalAccountValue: 0,
          sizeBreakdown: 'No sized accounts',
          sizeDistribution: [],
          payouts: payoutStats,
        })
      }
    })

    return { stats }
  } catch (error) {
    console.error('Error fetching propfirm catalogue data:', error)
    // Return empty stats on error
    return { stats: [] }
  }
}
