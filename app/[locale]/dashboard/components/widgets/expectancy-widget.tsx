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
            <div className="py-3 px-4 flex-none border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-white">{(t as any)('widgets.expectancy.title')}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-white/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{(t as any)('widgets.expectancy.tooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Target className="h-4 w-4 text-white/50" />
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[11px] font-medium tracking-tight text-white/50 mb-3">Value per trade</span>
                    <div className={cn(
                        "text-4xl font-semibold tracking-tight tabular-nums",
                        expectancy > 0 ? "metric-positive" : expectancy < 0 ? "metric-negative" : "text-white/50"
                    )}>
                        {expectancy > 0 ? '+' : ''}{formattedExpectancy}
                    </div>
                    <div className="mt-5 flex flex-col items-center gap-1">
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            expectancy > 0
                                ? "bg-white/10 metric-positive border border-white/20"
                                : expectancy < 0
                                    ? "bg-white/5 metric-negative border border-white/10"
                                    : "bg-white/5 text-white/30 border border-white/10"
                        )}>
                            {expectancy > 0 ? "Positive edge" : expectancy < 0 ? "Negative edge" : "Neutral"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
