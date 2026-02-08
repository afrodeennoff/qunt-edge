'use server'

import { prisma } from '@/lib/prisma'
import { MemberRole } from '@/prisma/generated/prisma'

export async function getTeamAnalyticsDataAction(teamId: string, userId: string) {
    try {
        const team = await prisma.team.findFirst({
            where: { id: teamId },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                accounts: {
                                    include: {
                                        trades: true
                                    }
                                }
                            }
                        }
                    }
                },
                analytics: {
                    where: { period: 'monthly' }
                }
            }
        })

        if (!team) throw new Error('Team not found')

        // Find if user is a member
        const isMember = team.members.some(m => m.userId === userId)
        if (!isMember) throw new Error('Unauthorized')

        // Aggregate data
        const membersData = team.members.map(member => {
            const trades = member.user.accounts.flatMap(a => a.trades)
            const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
            const winCount = trades.filter(t => t.pnl > 0).length
            const totalTrades = trades.length
            const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0

            return {
                userId: member.userId,
                email: member.user.email,
                totalPnL,
                totalTrades,
                winRate,
                trades
            }
        })

        // Sort by PnL
        membersData.sort((a, b) => b.totalPnL - a.totalPnL)

        // Team aggregate daily PnL for chart
        const dailyPnLMap: Record<string, number> = {}
        let grossProfit = 0
        let grossLoss = 0
        let bestDay = { date: '', pnl: -Infinity }

        membersData.forEach(m => {
            m.trades.forEach(t => {
                if (t.pnl > 0) grossProfit += t.pnl
                else grossLoss += Math.abs(t.pnl)

                const date = t.createdAt.toISOString().split('T')[0]
                dailyPnLMap[date] = (dailyPnLMap[date] || 0) + t.pnl
            })
        })

        Object.entries(dailyPnLMap).forEach(([date, pnl]) => {
            if (pnl > bestDay.pnl) {
                bestDay = { date, pnl }
            }
        })

        const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss

        const dates = Object.keys(dailyPnLMap).sort()
        let cumulativePnL = 0
        const chartData = dates.map(date => {
            cumulativePnL += dailyPnLMap[date]
            return {
                date,
                dailyPnL: dailyPnLMap[date],
                cumulativePnL
            }
        })

        return {
            success: true,
            data: {
                analytics: {
                    ...team.analytics[0],
                    profitFactor,
                    bestDay: bestDay.date ? { date: bestDay.date, pnl: bestDay.pnl } : null
                },
                membersPerformance: membersData.map(m => ({
                    userId: m.userId,
                    email: m.email,
                    totalPnL: m.totalPnL,
                    winRate: m.winRate,
                    totalTrades: m.totalTrades
                })),
                chartData
            }
        }

    } catch (error) {
        console.error('Error fetching analytics:', error)
        return { success: false, error: 'Failed to fetch analytics' }
    }
}
