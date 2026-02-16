"use client"

import React from "react"

import { useData } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function ExpectancyWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()

    const { expectancy } = React.useMemo(() => calculateAdvancedMetrics(trades as any), [trades])
    const hasData = (trades?.length ?? 0) > 0
    const isCompact = size === "small" || size === "small-long"

    const formattedExpectancy = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectancy)

    return (
        <WidgetShell
            title={(t as any)('widgets.expectancy.title')}
            icon={<Target className="h-4 w-4" />}
            info={<p className="text-xs">{(t as any)('widgets.expectancy.tooltip')}</p>}
            state={hasData ? "ready" : "empty"}
            emptyMessage={(t as any)("widgets.emptyState") ?? "No trades yet."}
        >
            <div className={cn("flex-1 flex flex-col items-center justify-center", isCompact ? "p-3" : "p-4")}>
                <div className="flex flex-col items-center justify-center">
                    <span className={cn("text-[11px] font-medium tracking-tight text-secondary-token", isCompact ? "mb-2" : "mb-3")}>Value per trade</span>
                    <div className={cn(
                        "font-semibold tracking-tight tabular-nums",
                        isCompact ? "text-3xl" : "text-4xl",
                        expectancy > 0 ? "metric-positive" : expectancy < 0 ? "metric-negative" : "text-secondary-token"
                    )}>
                        {expectancy > 0 ? '+' : ''}{formattedExpectancy}
                    </div>
                    <div className={cn("flex flex-col items-center gap-1", isCompact ? "mt-3" : "mt-5")}>
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            expectancy > 0
                                ? "bg-white/10 metric-positive border border-white/20"
                                : expectancy < 0
                                    ? "bg-white/5 metric-negative border border-white/10"
                                    : "bg-white/5 text-primary-token border border-white/10"
                        )}>
                            {expectancy > 0 ? "Positive edge" : expectancy < 0 ? "Negative edge" : "Neutral"}
                        </div>
                    </div>
                </div>
            </div>
        </WidgetShell>
    )
}
