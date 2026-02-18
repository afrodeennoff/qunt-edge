"use server"

import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";

export interface SmartInsight {
    id: string
    type: 'pattern' | 'risk' | 'opportunity' | 'achievement'
    title: string
    description: string
    confidence?: number // 0-100
    metric?: string
    trend?: 'up' | 'down' | 'neutral'
    action?: {
        label: string
        href?: string
    }
    timestamp: Date
}

export async function getSmartInsights(userId: string): Promise<SmartInsight[]> {
    try {
        // 1. Get recent trading data for this user
        const endDate = new Date()
        const startDate = subMonths(endDate, 1)

        // TODO: In a real implementation, we would query TradeAnalytics and aggregation services.
        // For now, we simulate insights based on "mock" analysis or simple queries.

        // Example simple query: check consistent profit days
        const recentTrades = await prisma.trade.findMany({
            where: {
                userId,
                entryDate: { gte: startDate }
            },
            select: {
                id: true,
                pnl: true,
                instrument: true,
                entryDate: true,
                side: true
            },
            orderBy: { entryDate: 'desc' },
            take: 100
        })

        const tradeIds = recentTrades.map(t => t.id)
        const tradeAnalytics = tradeIds.length > 0
            ? await prisma.tradeAnalytics.findMany({
                where: { tradeId: { in: tradeIds } }
            })
            : []

        const insights: SmartInsight[] = []

        // ---- Insight Logic 1: Instrument Preference ----
        const instrumentCounts = recentTrades.reduce((acc, trade) => {
            acc[trade.instrument] = (acc[trade.instrument] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const favoriteInstrument = Object.entries(instrumentCounts).sort((a, b) => b[1] - a[1])[0]

        if (favoriteInstrument) {
            insights.push({
                id: 'fav-instrument',
                type: 'pattern',
                title: 'Instrument Specialist',
                description: `You've executed ${favoriteInstrument[1]} trades on ${favoriteInstrument[0]} this month. Maintain focus on this pair to maximize edge.`,
                confidence: 85,
                metric: favoriteInstrument[0],
                timestamp: new Date()
            })
        }

        // ---- Insight Logic 2: Risk Alert (Consecutive Losses) ----
        // Simple heuristic: 3 losses in a row at the top of the list
        let consecutiveLosses = 0;
        for (const trade of recentTrades) {
            if (Number(trade.pnl) < 0) consecutiveLosses++;
            else break;
        }

        if (consecutiveLosses >= 3) {
            insights.push({
                id: 'risk-streak',
                type: 'risk',
                title: 'Drawdown Alert',
                description: `You are on a ${consecutiveLosses}-trade losing streak. Consider reducing position size or taking a break.`,
                metric: `-${consecutiveLosses} Streak`,
                trend: 'down',
                action: {
                    label: 'Review Risk',
                    href: '/dashboard/risk'
                },
                timestamp: new Date()
            })
        }

        // ---- Insight Logic 3: Execution Efficiency (from TradeAnalytics) ----
        // Calculate average efficiency if data is available
        const efficiencyValues = tradeAnalytics
            .map(a => a.efficiency ? Number(a.efficiency) : null)
            .filter((val): val is number => val !== null && val > 0)

        if (efficiencyValues.length >= 5) {
            const avgEfficiency = efficiencyValues.reduce((a, b) => a + b, 0) / efficiencyValues.length

            if (avgEfficiency > 70) {
                insights.push({
                    id: 'high-efficiency',
                    type: 'achievement',
                    title: 'High Execution Efficiency',
                    description: `Your average trade efficiency is ${avgEfficiency.toFixed(1)}%. You are capturing most of the available move.`,
                    confidence: 90,
                    metric: `${avgEfficiency.toFixed(1)}% Eff.`,
                    trend: 'up',
                    timestamp: new Date()
                })
            } else if (avgEfficiency < 30) {
                insights.push({
                    id: 'low-efficiency',
                    type: 'opportunity',
                    title: 'Efficiency Opportunity',
                    description: `Your average efficiency is ${avgEfficiency.toFixed(1)}%. You might be leaving money on the table by exiting too early.`,
                    confidence: 80,
                    metric: `${avgEfficiency.toFixed(1)}% Eff.`,
                    trend: 'neutral',
                    action: {
                        label: 'Review Exits',
                        href: '/dashboard/journal'
                    },
                    timestamp: new Date()
                })
            }
        }

        // ---- Insight Logic 4: Risk/Reward Ratio (from TradeAnalytics) ----
        const rrValues = tradeAnalytics
            .map(a => a.riskRewardRatio ? Number(a.riskRewardRatio) : null)
            .filter((val): val is number => val !== null && val > 0)

        if (rrValues.length >= 5) {
            const avgRR = rrValues.reduce((a, b) => a + b, 0) / rrValues.length

            if (avgRR > 2) {
                insights.push({
                    id: 'good-rr',
                    type: 'achievement',
                    title: 'Excellent Risk/Reward',
                    description: `Your average risk/reward ratio is ${avgRR.toFixed(2)}. This sustainable approach supports long-term profitability.`,
                    confidence: 85,
                    metric: `${avgRR.toFixed(2)} R:R`,
                    trend: 'up',
                    timestamp: new Date()
                })
            } else if (avgRR < 1) {
                insights.push({
                    id: 'low-rr',
                    type: 'risk',
                    title: 'Risk/Reward Alert',
                    description: `Your average R:R is ${avgRR.toFixed(2)}. Your winners are smaller than your average risk per trade.`,
                    confidence: 85,
                    metric: `${avgRR.toFixed(2)} R:R`,
                    trend: 'down',
                    action: {
                        label: 'Analyze R:R',
                        href: '/dashboard/analytics'
                    },
                    timestamp: new Date()
                })
            }
        }

        if (recentTrades.length === 0) {
            insights.push({
                id: 'welcome',
                type: 'achievement',
                title: 'Welcome to Qunt Edge',
                description: 'Start importing your trades or connect a broker account to unlock AI-driven insights.',
                action: {
                    label: 'Connect Account',
                    href: '/dashboard/settings'
                },
                timestamp: new Date()
            })
        }

        return insights

    } catch (error) {
        console.error('Error generating insights:', error)
        return []
    }
}
