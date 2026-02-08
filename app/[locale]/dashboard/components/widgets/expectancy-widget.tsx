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
            <div className="py-3 px-4 flex-none border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight text-fg-primary">{t('widgets.expectancy.title')}</span>
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-fg-muted mb-4">Value Per Trade</span>
                    <div className={cn(
                        "text-4xl font-black tracking-tighter tabular-nums drop-shadow-2xl",
                        expectancy > 0 ? "text-accent-teal" : expectancy < 0 ? "text-rose-500" : "text-fg-muted"
                    )}>
                        {expectancy > 0 ? '+' : ''}{formattedExpectancy}
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                            expectancy > 0 ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        )}>
                            {expectancy > 0 ? "Positive Edge" : "Negative Edge"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

