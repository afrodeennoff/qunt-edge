"use client"

import React from "react"

import { useDashboardStats } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"

export default function ExpectancyWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useDashboardStats()
    const t = useI18n()

    const { expectancy } = React.useMemo(() => calculateAdvancedMetrics(trades as any), [trades])
    const hasData = (trades?.length ?? 0) > 0

    const formattedExpectancy = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectancy)

    return (
        <WidgetShell
            title={(t as any)('widgets.expectancy.title')}
            icon={<Target className="h-4 w-4" />}
            info={<p className="text-xs">{(t as any)('widgets.expectancy.tooltip')}</p>}
            state={hasData ? "ready" : "empty"}
            emptyMessage={(t as any)("widgets.emptyState") ?? "No trades yet."}
        >
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[11px] font-medium tracking-tight text-muted-foreground/85 mb-3">Value per trade</span>
                    <div className={cn(
                        "text-4xl font-semibold tracking-tight tabular-nums",
                        expectancy > 0 ? "metric-positive" : expectancy < 0 ? "metric-negative" : "text-muted-foreground/85"
                    )}>
                        {expectancy > 0 ? '+' : ''}{formattedExpectancy}
                    </div>
                    <div className="mt-5 flex flex-col items-center gap-1">
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            expectancy > 0
                                ? "bg-secondary/30 metric-positive border border-border/60"
                                : expectancy < 0
                                    ? "bg-secondary/22 metric-negative border border-border/55"
                                    : "bg-secondary/22 text-muted-foreground/85 border border-border/55"
                        )}>
                            {expectancy > 0 ? "Positive edge" : expectancy < 0 ? "Negative edge" : "Neutral"}
                        </div>
                    </div>
                </div>
            </div>
        </WidgetShell>
    )
}
