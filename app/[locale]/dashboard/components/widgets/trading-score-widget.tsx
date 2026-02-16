"use client"

import React from "react"
import { useData } from "@/context/data-provider"
import { calculateTradingScore, deriveScoreMetricsFromTrades, getScoreLabel } from "@/lib/score-calculator"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function TradingScoreWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()

    const metrics = React.useMemo(() => {
        return deriveScoreMetricsFromTrades(trades as Array<{ pnl?: number | string | null; commission?: number | string | null }>)
    }, [trades])

    const score = calculateTradingScore(metrics)
    const label = getScoreLabel(score)

    const normalizedLabel = label.toLowerCase()
    const hasData = metrics.totalTrades > 0
    const isCompact = size === "small" || size === "small-long"
    const scoreClassName = isCompact ? "text-3xl" : "text-4xl"
    const legendSpacingClassName = isCompact ? "mt-3 gap-1.5" : "mt-6 gap-2"
    const statCardPaddingClassName = isCompact ? "p-2" : "p-2.5"
    const statValueClassName = isCompact ? "text-xs mt-0.5" : "text-sm mt-0.5"
    const statLabelClassName = isCompact ? "text-[9px]" : "text-[10px]"

    return (
        <WidgetShell
            title={(t as any)('widgets.tradingScore.title')}
            icon={<Trophy className="h-4 w-4" />}
            info={<p className="text-xs">{(t as any)('widgets.tradingScore.tooltip')}</p>}
            state={hasData ? "ready" : "empty"}
            emptyMessage={(t as any)("widgets.emptyState") ?? "No trades yet."}
        >
            <div className={cn("flex-1 flex flex-col items-center justify-center", isCompact ? "p-3" : "p-4")}>
                <div className="relative flex items-center justify-center">
                    <div className={cn("font-semibold tracking-tight tabular-nums mb-1", scoreClassName)}>
                        <span className={score >= 80 ? "metric-positive" : "metric-negative font-normal"}>
                            {score}
                        </span>
                        <span className="text-base text-secondary-token ml-1">/ 100</span>
                    </div>
                </div>
                <div className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight bg-white/5 text-primary-token border border-white/10"
                )}>
                    {normalizedLabel}
                </div>
                <div className={cn("grid grid-cols-3 w-full text-center", legendSpacingClassName)}>
                    <div className={cn("flex flex-col bg-white/5 rounded-xl border border-white/10", statCardPaddingClassName)}>
                        <span className={cn("font-medium tracking-tight text-secondary-token", statLabelClassName)}>Win Rate</span>
                        <span className={cn("font-semibold tabular-nums text-primary-token", statValueClassName)}>{metrics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className={cn("flex flex-col bg-white/5 rounded-xl border border-white/10", statCardPaddingClassName)}>
                        <span className={cn("font-medium tracking-tight text-secondary-token", statLabelClassName)}>P. Factor</span>
                        <span className={cn("font-semibold tabular-nums text-primary-token", statValueClassName)}>{metrics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className={cn("flex flex-col bg-white/5 rounded-xl border border-white/10", statCardPaddingClassName)}>
                        <span className={cn("font-medium tracking-tight text-secondary-token", statLabelClassName)}>Trades</span>
                        <span className={cn("font-semibold tabular-nums text-primary-token", statValueClassName)}>{metrics.totalTrades}</span>
                    </div>
                </div>
            </div>
        </WidgetShell>
    )
}
