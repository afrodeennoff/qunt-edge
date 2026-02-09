"use client"

import React from "react"

import { useData } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import { Info, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useI18n, useCurrentLocale } from "@/locales/client"

export default function RiskMetricsWidget({ size = 'medium' }: { size?: 'tiny' | 'small' | 'medium' | 'large' | 'small-long' | 'extra-large' }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()
    const locale = useCurrentLocale()

    const { kellyHalf, kellyFull, sharpeRatio, sortinoRatio, calmarRatio, maxDrawdown } = React.useMemo(() => calculateAdvancedMetrics(trades as any), [trades])

    // Format currency helper
    const formatCurrency = (value: number) => {
        const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
        return formatted
    }

    // Determine colors
    const goodColor = "text-emerald-500"
    const badColor = "text-amber-500" // or red-500 depending on severity
    const neutralColor = "text-muted-foreground"

    return (
        <div className="h-full flex flex-col bg-transparent">
            <div
                className={cn(
                    "flex-none border-b border-white/5",
                    size === 'tiny'
                        ? "py-1 px-2"
                        : (size === 'small' || size === 'small-long')
                            ? "py-2 px-3"
                            : "py-3 px-4"
                )}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                                size === 'tiny'
                                    ? "text-xs"
                                    : (size === 'small' || size === 'small-long')
                                        ? "text-sm"
                                        : "text-base"
                            )}
                        >
                            {t('widgets.riskMetrics.title')}
                        </span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-fg-muted" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{t('widgets.riskMetrics.tooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <ShieldAlert className="h-4 w-4 text-fg-muted" />
                </div>
            </div>
            <div className="flex-1 p-0 overflow-hidden">
                <div className="grid h-full grid-cols-2">
                    {/* Return Risk Ratios */}
                    <div className={cn(
                        "flex flex-col border-r border-b border-white/5",
                        size === 'tiny' ? "p-1.5" : "p-4"
                    )}>
                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-fg-muted">Ratios</h3>
                        <div className="flex-1 flex flex-col justify-center gap-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-fg-secondary text-xs">Sharpe</span>
                                <span className={cn("text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md", sharpeRatio > 1 ? "text-accent-teal bg-accent-teal/10" : "text-rose-500 bg-rose-500/10")}>
                                    {sharpeRatio.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-fg-secondary text-xs">Sortino</span>
                                <span className={cn("text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md", sortinoRatio > 1.5 ? "text-accent-teal bg-accent-teal/10" : "text-rose-500 bg-rose-500/10")}>
                                    {sortinoRatio.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-fg-secondary text-xs">Calmar</span>
                                <span className={cn("text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md", calmarRatio > 1 ? "text-accent-teal bg-accent-teal/10" : "text-rose-500 bg-rose-500/10")}>
                                    {calmarRatio.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Position Sizing */}
                    <div className={cn(
                        "flex flex-col border-b border-white/5",
                        size === 'tiny' ? "p-1.5" : "p-4"
                    )}>
                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-fg-muted">Position Sizing</h3>
                        <div className="flex-1 flex flex-col justify-center gap-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-fg-secondary text-xs text-balance">Kelly Half</span>
                                <span className={cn("text-xs font-bold tabular-nums", kellyHalf > 0 ? "text-accent-teal" : "text-rose-500")}>
                                    {(kellyHalf * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-fg-secondary text-xs">Optimal</span>
                                <span className={cn("text-xs font-bold tabular-nums", kellyFull > 0 ? "text-accent-teal" : "text-rose-500")}>
                                    {(kellyFull * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-fg-secondary text-xs">Conservative</span>
                                <span className={cn("text-xs font-bold tabular-nums", kellyHalf > 0 ? "text-accent-teal" : "text-rose-500")}>
                                    {((kellyHalf / 2) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Drawdown Section */}
                    <div className={cn(
                        "flex flex-col col-span-2",
                        size === 'tiny' ? "p-1.5" : "p-4"
                    )}>
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-fg-muted">Max Drawdown</h3>
                                <span className="text-xl font-black tabular-nums text-rose-500">
                                    {formatCurrency(maxDrawdown)}
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500/50 w-full animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
