"use client"

import * as React from "react"
import {
    Brain,
    AlertTriangle,
    Lightbulb,
    CheckCircle2,
    ArrowRight,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getSmartInsights, InsightActionTarget, SmartInsight } from "../../actions/get-smart-insights"
import { useUserStore } from "@/store/user-store"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { WidgetShell, WidgetShellState } from "@/components/ui/widget-shell"
import { WidgetSize } from "../../types/dashboard"

interface SmartInsightsWidgetProps {
    size?: WidgetSize
}

export function SmartInsightsWidget({ size = 'medium' }: SmartInsightsWidgetProps) {
    const t = useI18n()
    const locale = useCurrentLocale()
    const [insights, setInsights] = React.useState<SmartInsight[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(false)
    const user = useUserStore(state => state.supabaseUser)

    const fetchInsights = React.useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        setError(false)
        try {
            const data = await getSmartInsights()
            setInsights([...data].sort((a, b) => (b.confidence || 0) - (a.confidence || 0)))
        } catch (error) {
            console.error('Failed to load insights', error)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    React.useEffect(() => {
        fetchInsights()
    }, [fetchInsights])

    // Determine widget state
    const widgetState: WidgetShellState = React.useMemo(() => {
        if (error) return "error"
        if (loading) return "loading"
        if (insights.length === 0) return "empty"
        return "ready"
    }, [error, loading, insights.length])

    const getIcon = (type: SmartInsight['type']) => {
        switch (type) {
            case 'risk': return <AlertTriangle className="h-4 w-4 text-foreground/75" />
            case 'opportunity': return <Lightbulb className="h-4 w-4 text-foreground/75" />
            case 'achievement': return <CheckCircle2 className="h-4 w-4 text-foreground/90" />
            default: return <Brain className="h-4 w-4 text-foreground/90" />
        }
    }

    const allowedTargets = React.useMemo<ReadonlySet<InsightActionTarget>>(
      () =>
        new Set<InsightActionTarget>([
          "/dashboard",
          "/dashboard?tab=table",
          "/dashboard?tab=accounts",
          "/dashboard/reports",
          "/dashboard/behavior",
          "/dashboard/trader-profile",
          "/dashboard/settings",
          "/dashboard/import",
          "/dashboard/data",
        ]),
      []
    );

    const toLocalizedHref = React.useCallback(
      (href: InsightActionTarget) => `/${locale}${href}`,
      [locale]
    );

    const resolveInsightHref = React.useCallback(
      (href: InsightActionTarget | undefined) => {
        if (!href || !allowedTargets.has(href)) return toLocalizedHref("/dashboard");
        return toLocalizedHref(href);
      },
      [allowedTargets, toLocalizedHref]
    );

    const formatInsightDate = React.useCallback((timestamp: Date | string) => {
      return new Date(timestamp).toLocaleDateString(locale);
    }, [locale]);

    if (size === "tiny") {
      // Keep API stable for tiny variant while avoiding unused-prop lint.
    }

    return (
        <WidgetShell
            title={t('widgets.smartInsights.title')}
            icon={<Brain className="h-4 w-4 text-primary" />}
            description={t('widgets.smartInsights.tooltip')}
            actions={
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={fetchInsights}
                    disabled={loading}
                >
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                </Button>
            }
            state={widgetState}
            emptyMessage={
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Brain className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No insights available yet.</p>
                    <p className="text-xs opacity-60">Trade more to generate data.</p>
                </div>
            }
            errorMessage="Failed to load insights. Please try again."
            className="h-full flex flex-col overflow-hidden relative group"
            contentClassName="flex-1 overflow-hidden p-0"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-3 pt-2">
                    <AnimatePresence mode="popLayout">
                        {insights.map((insight) => (
                            <motion.div
                                key={insight.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group/item relative flex flex-col gap-2 rounded-lg border border-border/55 bg-secondary/22 p-3 hover:bg-secondary/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 border border-border/55",
                                            insight.type === 'risk' && "bg-secondary/35 border-border/55",
                                            insight.type === 'opportunity' && "bg-secondary/35 border-border/55",
                                        )}>
                                            {getIcon(insight.type)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium leading-none">{insight.title}</h4>
                                            <span className="text-[10px] text-muted-foreground/70">
                                                {formatInsightDate(insight.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                    {insight.confidence && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-secondary/22 border-border/55 text-muted-foreground/70">
                                            {insight.confidence}% Conf.
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground pl-[42px]">
                                    {insight.description}
                                </p>

                                {insight.action && (
                                    <div className="flex justify-end mt-1">
                                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1 text-primary hover:text-primary/80 hover:bg-primary/10 font-bold uppercase tracking-widest" asChild>
                                            <Link href={resolveInsightHref(insight.action.href)}>
                                                {insight.action.label}
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </WidgetShell>
    )
}
