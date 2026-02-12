"use client"

import React from "react"
import { useData } from "@/context/data-provider"
import { calculateTradingScore, deriveScoreMetricsFromTrades, getScoreLabel, getScoreColor } from "@/lib/score-calculator"
import { Info, Trophy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"

export default function TradingScoreWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()

    const metrics = React.useMemo(() => {
        return deriveScoreMetricsFromTrades(trades as Array<{ pnl?: number | string | null; commission?: number | string | null }>)
    }, [trades])

    const score = calculateTradingScore(metrics)
    const label = getScoreLabel(score)
    const colorClass = getScoreColor(score)

    const normalizedLabel = label.toLowerCase()

    return (
        <div className="h-full flex flex-col bg-transparent">
            <div className="py-3 px-4 flex-none border-b border-white/[0.03]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-white">{(t as any)('widgets.tradingScore.title')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-white/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{(t as any)('widgets.tradingScore.tooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Trophy className="h-4 w-4 text-white" />
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative flex items-center justify-center">
                    <div className="text-4xl font-semibold tracking-tight tabular-nums mb-1">
                        <span className={score >= 80 ? "text-white" : "text-white font-normal"}>
                            {score}
                        </span>
                        <span className="text-base text-white/50 ml-1">/ 100</span>
                    </div>
                </div>
                <div className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight bg-white/5 text-white border border-white/10"
                )}>
                    {normalizedLabel}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 w-full text-center">
                    <div className="flex flex-col p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-medium tracking-tight text-white/50">Win Rate</span>
                        <span className="font-semibold text-sm tabular-nums mt-0.5 text-white">{metrics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-medium tracking-tight text-white/50">P. Factor</span>
                        <span className="font-semibold text-sm tabular-nums mt-0.5 text-white">{metrics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-medium tracking-tight text-white/50">Trades</span>
                        <span className="font-semibold text-sm tabular-nums mt-0.5 text-white">{metrics.totalTrades}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
