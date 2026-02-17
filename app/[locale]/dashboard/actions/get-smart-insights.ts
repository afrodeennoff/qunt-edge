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

        // TODO: In a real implementation, we would query TradeAnalytics and aggregation services.
        // For now, we simulate insights based on "mock" analysis or simple queries.

        // Example simple query: check consistent profit days
        const recentTrades = await prisma.trade.findMany({
            where: {
                userId,
                entryDate: { gte: startDate }
            },
            select: {
                pnl: true,
                instrument: true,
                entryDate: true,
                side: true
            },
            orderBy: { entryDate: 'desc' },
            take: 100
        })

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

        // ---- Mock AI Insights (Placeholder for advanced ML models) ----
        insights.push({
            id: 'ai-opportunity',
            type: 'opportunity',
            title: 'Volatility Window',
            description: 'High expected volatility for NQ futures in the 14:00-16:00 UTC window based on historicals.',
            confidence: 72,
            action: {
                label: 'View Calendar',
                href: '/dashboard/calendar'
            },
            timestamp: subDays(new Date(), 0)
        })

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
