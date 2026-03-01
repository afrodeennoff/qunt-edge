"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/locales/client"
import { WidgetShell } from "@/components/ui/widget-shell"
import { Building2, Users, DollarSign } from "lucide-react"
import { getPropfirmCatalogueData } from "@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue"
import type { PropfirmCatalogueStats } from "@/app/[locale]/(landing)/propfirms/actions/types"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PropfirmCatalogueWidget() {
    const t = useI18n()
    const [stats, setStats] = useState<PropfirmCatalogueStats[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const sortedStats = useMemo(
        () => [...stats].sort((a, b) => b.payouts.paidAmount - a.payouts.paidAmount),
        [stats]
    )

    useEffect(() => {
        async function fetchData() {
            try {
                const { stats: fetchedStats } = await getPropfirmCatalogueData('allTime')
                setStats(fetchedStats)
            } catch (error) {
                console.error("Failed to fetch propfirm catalogue:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <WidgetShell
            title={t('landing.propfirms.title')}
            icon={<Building2 className="h-4 w-4" />}
            state={isLoading ? "loading" : stats.length > 0 ? "ready" : "empty"}
            emptyMessage="No propfirm activity tracked yet."
        >
            <ScrollArea className="h-full">
                <div className="flex flex-col gap-1 p-3">
                    {sortedStats.map((stat) => (
                        <div
                            key={stat.propfirmName}
                            className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className="font-bold text-sm truncate tracking-tight">{stat.propfirmName}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Users className="w-3 h-3 opacity-60" />
                                        <span>{stat.accountsCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <DollarSign className="w-3 h-3 opacity-60 text-semantic-success/80" />
                                        <span className="text-semantic-success/80 font-medium">{stat.payouts.paidCount} Payouts</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-[13px] font-bold text-foreground tracking-tight tabular-nums">
                                    ${stat.payouts.paidAmount > 1000
                                        ? `${(stat.payouts.paidAmount / 1000).toFixed(1)}k`
                                        : stat.payouts.paidAmount.toLocaleString()}
                                </div>
                                <div className="text-[9px] font-semibold text-semantic-success/80 uppercase tracking-wider">
                                    Paid
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </WidgetShell>
    )
}
