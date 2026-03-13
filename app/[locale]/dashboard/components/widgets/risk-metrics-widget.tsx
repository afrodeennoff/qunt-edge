"use client"

import React from "react"

import { useDashboardStats } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import { ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n, useCurrentLocale } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function RiskMetricsWidget({ size = 'medium' }: { size?: 'tiny' | 'small' | 'medium' | 'large' | 'small-long' | 'extra-large' }) {
    const { formattedTrades: trades } = useDashboardStats()
    const t = useI18n()
    const locale = useCurrentLocale()

    const { kellyHalf, kellyFull, sharpeRatio, sortinoRatio, calmarRatio, maxDrawdown } = React.useMemo(
        () => calculateAdvancedMetrics(trades),
        [trades],
    )
    const translate = t as (key: string) => string
    const hasData = (trades?.length ?? 0) > 0
    const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0)
    const safeKellyHalf = safeNumber(kellyHalf)
    const safeKellyFull = safeNumber(kellyFull)
    const safeSharpeRatio = safeNumber(sharpeRatio)
    const safeSortinoRatio = safeNumber(sortinoRatio)
    const safeCalmarRatio = safeNumber(calmarRatio)
    const safeMaxDrawdown = safeNumber(maxDrawdown)

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

    return (
        <WidgetShell
            title={translate('widgets.riskMetrics.title')}
            icon={<ShieldAlert className="h-4 w-4" />}
            info={<p className="text-xs">{translate('widgets.riskMetrics.tooltip')}</p>}
            state={hasData ? "ready" : "empty"}
            emptyMessage={translate("widgets.emptyState") ?? "No trades yet."}
            contentClassName="p-0"
        >
            <div className="flex-1 p-0 overflow-hidden">
                <div className="grid h-full grid-cols-2">
                    {/* Return Risk Ratios */}
                    <div className={cn(
                        "flex flex-col border-r border-b border-border/55",
                        size === 'tiny' ? "p-1.5" : "p-4"
                    )}>
                        <h3 className="text-[11px] font-medium tracking-tight mb-3 text-muted-foreground/70">Ratios</h3>
                        <div className="flex-1 flex flex-col justify-center gap-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70 text-xs">Sharpe</span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider tabular-nums px-2 py-0.5 rounded-md", safeSharpeRatio > 1 ? "text-foreground/90 bg-secondary/30 border border-border/55" : "text-muted-foreground/85 bg-secondary/22 border border-border/55")}>
                                    {safeSharpeRatio.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70 text-xs">Sortino</span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider tabular-nums px-2 py-0.5 rounded-md", safeSortinoRatio > 1.5 ? "text-foreground/90 bg-secondary/30 border border-border/55" : "text-muted-foreground/85 bg-secondary/22 border border-border/55")}>
                                    {safeSortinoRatio.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70 text-xs">Calmar</span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider tabular-nums px-2 py-0.5 rounded-md", safeCalmarRatio > 1 ? "text-foreground/90 bg-secondary/30 border border-border/55" : "text-muted-foreground/85 bg-secondary/22 border border-border/55")}>
                                    {safeCalmarRatio.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Position Sizing */}
                    <div className={cn(
                        "flex flex-col border-b border-border/55",
                        size === 'tiny' ? "p-1.5" : "p-4"
                    )}>
                        <h3 className="text-[11px] font-medium tracking-tight mb-3 text-muted-foreground/70">Position sizing</h3>
                        <div className="flex-1 flex flex-col justify-center gap-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70 text-xs text-balance">Kelly Half</span>
                                <span className={cn("text-xs font-mono font-bold tabular-nums", safeKellyHalf > 0 ? "metric-positive" : "metric-negative")}>
                                    {(safeKellyHalf * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70 text-xs">Optimal</span>
                                <span className={cn("text-xs font-mono font-bold tabular-nums", safeKellyFull > 0 ? "metric-positive" : "metric-negative")}>
                                    {(safeKellyFull * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70 text-xs">Conservative</span>
                                <span className={cn("text-xs font-mono font-bold tabular-nums", safeKellyHalf > 0 ? "metric-positive" : "metric-negative")}>
                                    {((safeKellyHalf / 2) * 100).toFixed(1)}%
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
                                <span className="text-xl font-bold font-mono tracking-tight tabular-nums text-foreground/90">
                                    {formatCurrency(safeMaxDrawdown)}
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-1 bg-secondary/22 rounded-full overflow-hidden">
                            <div className="h-full bg-foreground/40 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </WidgetShell>
    )
}
