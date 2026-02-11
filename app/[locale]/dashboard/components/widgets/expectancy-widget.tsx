"use client"

import React from "react"

import { useData } from "@/context/data-provider"
import { calculateAdvancedMetrics } from "@/lib/advanced-metrics"
import { Info, Target } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"

export default function ExpectancyWidget({ size }: { size?: string }) {
    const { formattedTrades: trades } = useData()
    const t = useI18n()

    const { expectancy } = React.useMemo(() => calculateAdvancedMetrics(trades as any), [trades])

    const formattedExpectancy = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectancy)

    return (
        <div className="h-full flex flex-col bg-transparent">
            <div className="py-3 px-4 flex-none border-b border-border/45">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-fg-primary">{t('widgets.expectancy.title')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-fg-muted" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{t('widgets.expectancy.tooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Target className="h-4 w-4 text-fg-muted" />
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[11px] font-medium tracking-tight text-fg-muted mb-3">Value per trade</span>
                    <div className={cn(
                        "text-4xl font-semibold tracking-tight tabular-nums",
                        expectancy > 0 ? "text-accent-teal" : expectancy < 0 ? "text-rose-500" : "text-fg-muted"
                    )}>
                        {expectancy > 0 ? '+' : ''}{formattedExpectancy}
                    </div>
                    <div className="mt-5 flex flex-col items-center gap-1">
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight",
                            expectancy > 0
                                ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                                : expectancy < 0
                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                    : "bg-muted/25 text-muted-foreground border border-border/45"
                        )}>
                            {expectancy > 0 ? "Positive edge" : expectancy < 0 ? "Negative edge" : "Neutral"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
