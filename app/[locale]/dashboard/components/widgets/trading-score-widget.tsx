"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-provider"
import { calculateTradingScore, getScoreLabel, getScoreColor } from "@/lib/score-calculator"
import { Info, Trophy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { Trade } from "@/prisma/generated/prisma"

export default function TradingScoreWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()

    const metrics = React.useMemo(() => {
        if (!trades || trades.length === 0) return { winRate: 0, profitFactor: 0, totalTrades: 0 }

        // Logic similar to statistics but kept simple for score
        const wins = trades.filter(t => (t.pnl ?? 0) > 0)
        const losses = trades.filter(t => (t.pnl ?? 0) <= 0) // considering BE as loss for strict PF? usually PF = GrossWin / GrossLoss
        // Strictly, PF = GrossWin / GrossLoss. WinRate = Win / Total.
        const grossWin = wins.reduce((acc, t) => acc + (t.pnl ?? 0), 0)
        const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl ?? 0), 0))

        const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 100 : 0 // Cap at 100 if no loss
        const winRate = (wins.length / trades.length) * 100

        return {
            winRate,
            profitFactor,
            totalTrades: trades.length
        }
    }, [trades])

    const score = calculateTradingScore(metrics)
    const label = getScoreLabel(score)
    const colorClass = getScoreColor(score)

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 flex-none border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{t('widgets.tradingScore.title')}</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('widgets.tradingScore.tooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Trophy className={cn("h-4 w-4", colorClass)} />
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative flex items-center justify-center">
                    {/* Simple circular display or just big number */}
                    <div className="text-5xl font-bold tracking-tighter tabular-nums mb-2">
                        <span className={colorClass}>{score}</span>
                        <span className="text-lg text-muted-foreground ml-1">/ 100</span>
                    </div>
                </div>
                <div className={cn("text-xl font-semibold uppercase tracking-widest", colorClass)}>
                    {label}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 w-full text-center text-xs">
                    <div className="flex flex-col p-2 bg-muted/40 rounded">
                        <span className="text-muted-foreground font-medium">Win Rate</span>
                        <span className="font-mono mt-1">{metrics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/40 rounded">
                        <span className="text-muted-foreground font-medium">P. Factor</span>
                        <span className="font-mono mt-1">{metrics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/40 rounded">
                        <span className="text-muted-foreground font-medium">Trades</span>
                        <span className="font-mono mt-1">{metrics.totalTrades}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
