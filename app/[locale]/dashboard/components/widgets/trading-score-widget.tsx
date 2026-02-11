"use client"

import React from "react"
import { useData } from "@/context/data-provider"
import { calculateTradingScore, getScoreLabel, getScoreColor } from "@/lib/score-calculator"
import { Info, Trophy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"

export default function TradingScoreWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()

    const metrics = React.useMemo(() => {
        if (!trades || trades.length === 0) return { winRate: 0, profitFactor: 0, totalTrades: 0 }

        // Logic similar to statistics but kept simple for score
        const wins = trades.filter(t => Number(t.pnl ?? 0) > 0)
        const losses = trades.filter(t => Number(t.pnl ?? 0) <= 0) // considering BE as loss for strict PF? usually PF = GrossWin / GrossLoss
        // Strictly, PF = GrossWin / GrossLoss. WinRate = Win / Total.
        const grossWin = wins.reduce((acc, t) => acc + Number(t.pnl ?? 0), 0)
        const grossLoss = Math.abs(losses.reduce((acc, t) => acc + Number(t.pnl ?? 0), 0))

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

    const normalizedLabel = label.toLowerCase()

    return (
        <div className="h-full flex flex-col bg-transparent">
            <div className="py-3 px-4 flex-none border-b border-border/45">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-fg-primary">{t('widgets.tradingScore.title')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-fg-muted" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{t('widgets.tradingScore.tooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Trophy className={cn("h-4 w-4", colorClass === "text-green-500" ? "text-accent-teal" : colorClass === "text-red-500" ? "text-rose-500" : colorClass)} />
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative flex items-center justify-center">
                    <div className="text-4xl font-semibold tracking-tight tabular-nums mb-1">
                        <span className={cn(colorClass === "text-green-500" ? "text-accent-teal" : colorClass === "text-red-500" ? "text-rose-500" : colorClass)}>
                            {score}
                        </span>
                        <span className="text-base text-fg-muted ml-1">/ 100</span>
                    </div>
                </div>
                <div className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight",
                    colorClass === "text-green-500" ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20" :
                        colorClass === "text-red-500" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                            "bg-muted/10 text-muted-foreground border border-muted/20"
                )}>
                    {normalizedLabel}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 w-full text-center">
                    <div className="flex flex-col p-2.5 bg-muted/30 rounded-xl border border-border/45">
                        <span className="text-[10px] font-medium tracking-tight text-fg-muted">Win Rate</span>
                        <span className="font-semibold text-sm tabular-nums mt-0.5 text-fg-primary">{metrics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-muted/30 rounded-xl border border-border/45">
                        <span className="text-[10px] font-medium tracking-tight text-fg-muted">P. Factor</span>
                        <span className="font-semibold text-sm tabular-nums mt-0.5 text-fg-primary">{metrics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-muted/30 rounded-xl border border-border/45">
                        <span className="text-[10px] font-medium tracking-tight text-fg-muted">Trades</span>
                        <span className="font-semibold text-sm tabular-nums mt-0.5 text-fg-primary">{metrics.totalTrades}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
