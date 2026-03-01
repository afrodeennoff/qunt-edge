"use client"

import * as React from "react"
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    CheckCircle2,
    ArrowRight,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getSmartInsights, InsightActionTarget, SmartInsight } from "../../actions/get-smart-insights"
import { useUserStore } from "@/store/user-store"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useCurrentLocale, useI18n } from "@/locales/client"

import { WidgetSize } from "../../types/dashboard"

interface SmartInsightsWidgetProps {
    size?: WidgetSize
}

export function SmartInsightsWidget({ size = 'medium' }: SmartInsightsWidgetProps) {
    const t = useI18n()
    const locale = useCurrentLocale()
    const [insights, setInsights] = React.useState<SmartInsight[]>([])
    const [loading, setLoading] = React.useState(true)
    const user = useUserStore(state => state.supabaseUser)

    const fetchInsights = React.useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        try {
            const data = await getSmartInsights(user.id)
            setInsights([...data].sort((a, b) => (b.confidence || 0) - (a.confidence || 0)))
        } catch (error) {
            console.error('Failed to load insights', error)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    React.useEffect(() => {
        fetchInsights()
    }, [fetchInsights])

    const getIcon = (type: SmartInsight['type']) => {
        switch (type) {
            case 'risk': return <AlertTriangle className="h-4 w-4 text-destructive" />
            case 'opportunity': return <Lightbulb className="h-4 w-4 text-semantic-warning" />
            case 'achievement': return <CheckCircle2 className="h-4 w-4 text-primary" />
            default: return <TrendingUp className="h-4 w-4 text-primary" />
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
        <Card className="h-full flex flex-col overflow-hidden border-border/60 bg-card/95 backdrop-blur-xl relative group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <div className="space-y-1">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        {t('widgets.smartInsights.title')}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">
                        {t('widgets.smartInsights.tooltip')}
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={fetchInsights}
                    disabled={loading}
                >
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-4 pb-4">
                    <div className="space-y-3 pt-2">
                        {loading && insights.length === 0 ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-lg border border-border/55 bg-secondary/22 p-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))
                        ) : (
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
                                                    insight.type === 'risk' && "bg-destructive/20 border-destructive/30",
                                                    insight.type === 'opportunity' && "bg-semantic-warning-bg/10 border-semantic-warning-border/20",
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
                        )}

                        {!loading && insights.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Brain className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-sm">No insights available yet.</p>
                                <p className="text-xs opacity-60">Trade more to generate data.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
