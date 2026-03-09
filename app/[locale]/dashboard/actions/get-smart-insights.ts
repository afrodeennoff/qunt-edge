"use server"

import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";

export type InsightActionTarget =
  | "/dashboard"
  | "/dashboard?tab=table"
  | "/dashboard?tab=accounts"
  | "/dashboard/reports"
  | "/dashboard/behavior"
  | "/dashboard/trader-profile"
  | "/dashboard/settings"
  | "/dashboard/import"
  | "/dashboard/data";

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
        href: InsightActionTarget
    }
    timestamp: Date
}

function roundPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function getSmartInsights(userId: string): Promise<SmartInsight[]> {
    try {
        const endDate = new Date();
        const startDate = subMonths(endDate, 3);

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
            take: 500
        });

        if (recentTrades.length === 0) {
          return [
            {
              id: "welcome",
              type: "achievement",
              title: "Welcome to Qunt Edge",
              description: "Import your first trades to unlock personalized behavioral and performance insights.",
              action: {
                label: "Import Trades",
                href: "/dashboard/import",
              },
              timestamp: new Date(),
            },
          ];
        }

        const insights: SmartInsight[] = [];

        const instrumentCounts = recentTrades.reduce((acc, trade) => {
            acc[trade.instrument] = (acc[trade.instrument] || 0) + 1
            return acc
        }, {} as Record<string, number>);

        const favoriteInstrument = Object.entries(instrumentCounts).sort((a, b) => b[1] - a[1])[0];

        if (favoriteInstrument) {
            const concentration = roundPct((favoriteInstrument[1] / recentTrades.length) * 100);
            insights.push({
                id: 'fav-instrument',
                type: 'pattern',
                title: 'Instrument Specialist',
                description: `${favoriteInstrument[1]} of your last ${recentTrades.length} trades (${concentration}%) were on ${favoriteInstrument[0]}. Keep execution rules tight on this instrument.`,
                confidence: roundPct(concentration + 15),
                metric: favoriteInstrument[0],
                action: {
                  label: "Review Trade Log",
                  href: "/dashboard?tab=table",
                },
                timestamp: new Date()
            });
        }

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
                description: `You are on a ${consecutiveLosses}-trade losing streak. Reduce size and review your recent setups before the next session.`,
                metric: `-${consecutiveLosses} Streak`,
                trend: 'down',
                action: {
                    label: 'Open Behavior',
                    href: '/dashboard/behavior'
                },
                timestamp: new Date()
            });
        }

        const dailyTradeCounts = recentTrades.reduce((acc, trade) => {
          const dayKey = trade.entryDate.toISOString().slice(0, 10);
          acc[dayKey] = (acc[dayKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const maxTradesInDay = Object.values(dailyTradeCounts).reduce((max, count) => Math.max(max, count), 0);

        if (maxTradesInDay >= 8) {
          insights.push({
            id: "overtrading-risk",
            type: "risk",
            title: "High Activity Cluster",
            description: `Your peak session reached ${maxTradesInDay} trades in one day. Verify that this aligns with your plan and risk budget.`,
            confidence: roundPct(Math.min(95, 55 + maxTradesInDay * 3)),
            metric: `${maxTradesInDay} Trades/Day`,
            trend: "down",
            action: {
              label: "Open Reports",
              href: "/dashboard/reports",
            },
            timestamp: new Date(),
          });
        }

        const latest30 = recentTrades.slice(0, 30);
        const winners30 = latest30.filter((trade) => Number(trade.pnl) > 0).length;
        const winRate30 = latest30.length > 0 ? roundPct((winners30 / latest30.length) * 100) : 0;

        if (latest30.length >= 10) {
          insights.push({
            id: "win-rate-snapshot",
            type: winRate30 >= 55 ? "achievement" : "opportunity",
            title: winRate30 >= 55 ? "Execution Stability" : "Win Rate Opportunity",
            description:
              winRate30 >= 55
                ? `Your last ${latest30.length} trades show a ${winRate30}% win rate. Keep your current setup discipline.`
                : `Your last ${latest30.length} trades show a ${winRate30}% win rate. Review losing setups and tighten entry filters.`,
            confidence: roundPct(Math.max(50, Math.abs(winRate30 - 50) + 50)),
            metric: `${winRate30}% Win Rate`,
            trend: winRate30 >= 55 ? "up" : "neutral",
            action: {
              label: "Open Trader Profile",
              href: "/dashboard/trader-profile",
            },
            timestamp: new Date(),
          });
        }

        if (insights.length === 0) {
          insights.push({
            id: "data-health",
            type: "opportunity",
            title: "Expand Data Coverage",
            description: "More complete trade data will improve behavioral trend detection and setup-level insights.",
            action: {
              label: "Manage Data",
              href: "/dashboard/data",
            },
            timestamp: new Date(),
          });
        }

        return insights

    } catch (error) {
        console.error('Error generating insights:', error)
        return []
    }
}
