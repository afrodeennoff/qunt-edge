"use server"

import { Timeframe } from "@/app/[locale]/(landing)/propfirms/actions/timeframe-utils";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, subMonths } from "date-fns";

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

        const insights: SmartInsight[] = []

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
            return insights
        }

        // Fetch Analytics for these trades
        const tradeIds = recentTrades.map(t => t.id)
        const analytics = await prisma.tradeAnalytics.findMany({
            where: {
                tradeId: { in: tradeIds }
            }
        })

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

        // ---- Insight Logic 3: Win Rate ----
        // Calculate Win Rate if enough trades (e.g., > 5)
        if (recentTrades.length >= 5) {
            const wins = recentTrades.filter(t => Number(t.pnl) > 0).length
            const winRate = (wins / recentTrades.length) * 100

            if (winRate > 60) {
                insights.push({
                    id: 'high-winrate',
                    type: 'achievement',
                    title: 'High Probability Trader',
                    description: `You have a ${winRate.toFixed(1)}% win rate over your last ${recentTrades.length} trades. Your strategy is showing strong consistency.`,
                    confidence: 90,
                    metric: `${winRate.toFixed(0)}% WR`,
                    trend: 'up',
                    timestamp: new Date()
                })
            }
        }

        // ---- Insight Logic 4: Risk/Reward (from Analytics) ----
        if (analytics.length > 0) {
            const validRR = analytics
                .filter(a => a.riskRewardRatio !== null && Number(a.riskRewardRatio) > 0)
                .map(a => Number(a.riskRewardRatio))

            if (validRR.length >= 5) {
                const avgRR = validRR.reduce((a, b) => a + b, 0) / validRR.length

                if (avgRR > 2.0) {
                    insights.push({
                        id: 'good-rr',
                        type: 'pattern',
                        title: 'Excellent Risk Management',
                        description: `Your average Risk/Reward ratio is ${avgRR.toFixed(2)}. You are effectively letting winners run and cutting losers early.`,
                        confidence: 85,
                        metric: `${avgRR.toFixed(2)} R:R`,
                        trend: 'up',
                        timestamp: new Date()
                    })
                } else if (avgRR < 1.0) {
                    insights.push({
                        id: 'poor-rr',
                        type: 'risk',
                        title: 'Risk/Reward Warning',
                        description: `Your average Risk/Reward ratio is ${avgRR.toFixed(2)}. Aim for at least 1.5 to improve long-term profitability.`,
                        confidence: 80,
                        metric: `${avgRR.toFixed(2)} R:R`,
                        trend: 'down',
                        action: {
                            label: 'Analyze Trades',
                            href: '/dashboard/journal'
                        },
                        timestamp: new Date()
                    })
                }
            }
        }

        // ---- Insight Logic 5: Execution Efficiency (from Analytics) ----
        if (analytics.length > 0) {
            const validEfficiency = analytics
                .filter(a => a.efficiency !== null)
                .map(a => Number(a.efficiency))

            if (validEfficiency.length >= 5) {
                const avgEfficiency = validEfficiency.reduce((a, b) => a + b, 0) / validEfficiency.length

                if (avgEfficiency > 80) {
                    insights.push({
                        id: 'high-efficiency',
                        type: 'achievement',
                        title: 'Sniper Execution',
                        description: `Your entry efficiency is ${avgEfficiency.toFixed(1)}%. You are entering trades with very little drawdown (MAE).`,
                        confidence: 75,
                        metric: `${avgEfficiency.toFixed(0)}% Eff`,
                        trend: 'up',
                        timestamp: new Date()
                    })
                } else if (avgEfficiency < 30) {
                    insights.push({
                        id: 'low-efficiency',
                        type: 'opportunity',
                        title: 'Entry Timing',
                        description: `Your efficiency is ${avgEfficiency.toFixed(1)}%. You often experience significant drawdown before profit. Consider waiting for better setups.`,
                        confidence: 70,
                        metric: `${avgEfficiency.toFixed(0)}% Eff`,
                        trend: 'neutral',
                        action: {
                            label: 'Review Entries',
                            href: '/dashboard/journal'
                        },
                        timestamp: new Date()
                    })
                }
            }
        }

        return insights

    } catch (error) {
        console.error('Error generating insights:', error)
        return []
    }
}
