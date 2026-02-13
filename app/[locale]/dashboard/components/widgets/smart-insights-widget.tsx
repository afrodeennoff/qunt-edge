"use client"

import * as React from "react"
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    CheckCircle2,
    MoreHorizontal,
    ArrowRight,
    Loader2,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getSmartInsights, SmartInsight } from "../../actions/get-smart-insights"
import { useUserStore } from "@/store/user-store"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useI18n } from "@/locales/client"

import { WidgetSize } from "../../types/dashboard"

interface SmartInsightsWidgetProps {
    size?: WidgetSize
}

export function SmartInsightsWidget({ size = 'medium' }: SmartInsightsWidgetProps) {
    const t = useI18n()
    const [insights, setInsights] = React.useState<SmartInsight[]>([])
    const [loading, setLoading] = React.useState(true)
    const user = useUserStore(state => state.supabaseUser)

    const fetchInsights = React.useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        try {
            const data = await getSmartInsights(user.id)
            // Sort by confidence or priority
            setInsights(data.sort((a, b) => (b.confidence || 0) - (a.confidence || 0)))
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
            case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'opportunity': return <Lightbulb className="h-4 w-4 text-yellow-500" />
            case 'achievement': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            default: return <TrendingUp className="h-4 w-4 text-blue-500" />
        }
    }

    const getBadgeVariant = (type: SmartInsight['type']) => {
        switch (type) {
            case 'risk': return "destructive"
            case 'opportunity': return "warning" // custom variant if exists, else outline
            case 'achievement': return "success" // custom variant if exists
            default: return "secondary"
        }
    }

    // Calculate if we should show compact view based on widget size
    const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

    return (
        <Card className="h-full flex flex-col overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl relative group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-400" />
                        {t('widgets.smartInsights.title')}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
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
                                <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
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
                                        className="group/item relative flex flex-col gap-2 rounded-lg border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-black/50 border border-white/10",
                                                    insight.type === 'risk' && "bg-red-500/10 border-red-500/20",
                                                    insight.type === 'opportunity' && "bg-yellow-500/10 border-yellow-500/20",
                                                )}>
                                                    {getIcon(insight.type)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium leading-none">{insight.title}</h4>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(insight.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {insight.confidence && (
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/10 border-white/5 text-white/70">
                                                    {insight.confidence}% Conf.
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground pl-[42px]">
                                            {insight.description}
                                        </p>

                                        {insight.action && (
                                            <div className="flex justify-end mt-1">
                                                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" asChild>
                                                    <Link href={insight.action.href || '#'}>
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
                                <Brain className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No insights available yet.</p>
                                <p className="text-xs opacity-50">Trade more to generate data.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
