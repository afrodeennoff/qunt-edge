"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap, BarChart3, Eye, EyeOff, X } from "lucide-react"
import { cn } from "@/lib/utils"
import React, { useState, useRef, useMemo, useEffect, type Dispatch, type SetStateAction } from "react"
import { motion } from "framer-motion"
import { useDashboardAccountsList, useDashboardStats } from "@/context/data-provider"
import { startOfDay, startOfWeek, startOfMonth, endOfDay, parseISO, isWithinInterval, format } from "date-fns"
import { calculateTradingScore } from "@/lib/score-calculator"
import { type Account } from "@/lib/data-types"
import html2canvas from "html2canvas"
import { useUserStore } from "@/store/user-store"

type Theme = {
    name: string;
    primary: string;
    glow: string;
    bgAccent: string;
    pattern: string;
}

const THEMES: Record<string, Theme> = {
    obsidian: { name: 'Obsidian', primary: 'text-foreground', glow: 'hsl(var(--foreground) / 0.35)', bgAccent: 'bg-foreground/10', pattern: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--foreground) / 0.35) 1px, transparent 0)' },
    graphite: { name: 'Graphite', primary: 'text-foreground/80', glow: 'hsl(var(--foreground) / 0.35)', bgAccent: 'bg-foreground/5', pattern: 'linear-gradient(hsl(var(--foreground) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.35) 1px, transparent 1px)' },
    silver: { name: 'Silver', primary: 'text-foreground/90', glow: 'hsl(var(--foreground) / 0.35)', bgAccent: 'bg-foreground/15', pattern: 'radial-gradient(hsl(var(--foreground) / 0.35) 2px, transparent 0)' },
    ghost: { name: 'Ghost', primary: 'text-foreground/60', glow: 'hsl(var(--foreground) / 0.35)', bgAccent: 'bg-foreground/5', pattern: 'repeating-linear-gradient(45deg, hsl(var(--foreground) / 0.35) 0, hsl(var(--foreground) / 0.35) 1px, transparent 0, transparent 50%)' }
}

const THEME_KEYS = ['obsidian', 'graphite', 'silver', 'ghost'] as const

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'total'

type CalendarEntry = {
    pnl?: number | string
    trades?: Array<{ pnl?: number | string }>
    tradeNumber?: number | string
}

type CalendarData = Record<string, CalendarEntry>

type DailySummaryStats = {
    daily: { pnl: number; wins: number; total: number }
    weekly: { pnl: number }
    monthly: { pnl: number }
    total: { pnl: number }
    winRate: number
    trendData: number[]
    currentStreak: number
}

const toSafeNumber = (value: unknown): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    if (typeof value === 'string') {
        const normalized = value.replace(/,/g, '').trim()
        if (!normalized) return 0
        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

const getTrendData = (calendarData: CalendarData, today: Date): number[] => {
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(today)
        day.setDate(today.getDate() - (6 - i))
        const key = format(day, 'yyyy-MM-dd')
        return toSafeNumber(calendarData[key]?.pnl)
    })
}

const getCurrentStreak = (calendarData: CalendarData, cutoff: Date): number => {
    const sortedEntries = Object.entries(calendarData)
        .map(([dateStr, data]) => ({ date: parseISO(dateStr), data }))
        .filter(({ date }) => !Number.isNaN(date.getTime()) && date <= cutoff)
        .sort((a, b) => b.date.getTime() - a.date.getTime())

    let streak = 0

    for (const entry of sortedEntries) {
        const pnl = toSafeNumber(entry.data.pnl)
        if (pnl > 0) {
            streak++
            continue
        }
        if (pnl < 0) break
    }

    return streak
}

const computeIntervalStats = (
    calendarData: CalendarData,
    startDay: Date,
    startWeek: Date,
    startMonth: Date,
    end: Date
) => {
    const daily = { pnl: 0, wins: 0, total: 0 }
    const weekly = { pnl: 0 }
    const monthly = { pnl: 0 }
    const total = { pnl: 0 }

    Object.entries(calendarData).forEach(([dateStr, data]) => {
        const date = parseISO(dateStr)
        const dayPnl = toSafeNumber(data.pnl)
        const trades = Array.isArray(data.trades) ? data.trades : []
        const tradeCount = toSafeNumber(data.tradeNumber) || trades.length

        if (isWithinInterval(date, { start: startDay, end })) {
            daily.pnl += dayPnl
            daily.total += tradeCount
            trades.forEach(trade => {
                if (toSafeNumber(trade.pnl) > 0) daily.wins++
            })
        }

        if (isWithinInterval(date, { start: startWeek, end })) weekly.pnl += dayPnl
        if (isWithinInterval(date, { start: startMonth, end })) monthly.pnl += dayPnl

        total.pnl += dayPnl
    })

    return { daily, weekly, monthly, total }
}

const buildDailySummaryStats = (calendarData: CalendarData): DailySummaryStats => {
    const today = new Date()
    const startDay = startOfDay(today)
    const startWeek = startOfWeek(today, { weekStartsOn: 1 })
    const startMonth = startOfMonth(today)
    const end = endOfDay(today)

    const { daily, weekly, monthly, total } = computeIntervalStats(calendarData, startDay, startWeek, startMonth, end)
    const trendData = getTrendData(calendarData, today)
    const currentStreak = getCurrentStreak(calendarData, end)
    const winRate = daily.total > 0 ? Math.round((daily.wins / daily.total) * 100) : 0

    return { daily, weekly, monthly, total, winRate, trendData, currentStreak }
}

type ExportSetter = Dispatch<SetStateAction<boolean>>

const downloadSummaryImage = async (cardEl: HTMLDivElement | null, setIsExporting: ExportSetter) => {
    if (!cardEl) return
    setIsExporting(true)

    try {
        const canvas = await html2canvas(cardEl, {
            backgroundColor: "hsl(var(--background))",
            scale: 2,
            logging: false,
            useCORS: true,
            width: cardEl.offsetWidth,
            height: cardEl.offsetHeight
        })

        const image = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = image
        link.download = `QuntEdge-Recap-${format(new Date(), 'yyyy-MM-dd')}.png`
        link.click()
    } catch (err) {
        console.error("Failed to export image:", err)
    } finally {
        setIsExporting(false)
    }
}

const shareSummaryImage = async (
    cardEl: HTMLDivElement | null,
    setIsExporting: ExportSetter,
    fallbackDownload: () => void
) => {
    if (!cardEl) return
    setIsExporting(true)

    try {
        const canvas = await html2canvas(cardEl, {
            backgroundColor: "hsl(var(--background))",
            scale: 2,
            logging: false,
            useCORS: true
        })

        canvas.toBlob(async (blob) => {
            if (!blob) return

            if (navigator.share) {
                const file = new File([blob], `Recap-${format(new Date(), 'yyyy-MM-dd')}.png`, { type: 'image/png' })
                try {
                    await navigator.share({
                        files: [file],
                        title: 'QuntEdge Trading Recap',
                        text: 'Check out my trading performance today!'
                    })
                } catch (err) {
                    console.error("Shared failed:", err)
                    fallbackDownload()
                }
            } else {
                fallbackDownload()
            }
        })
    } catch (err) {
        console.error("Failed to share image:", err)
    } finally {
        setIsExporting(false)
    }
}

type DashboardStatistics = ReturnType<typeof useDashboardStats>['statistics']

const computeGoalProgress = (totalPnl: number, target: number): number => {
    if (target <= 0) return 0
    return Math.min(Math.max((totalPnl / target) * 100, 0), 100)
}

const calculateScoreValue = (overallStats: DashboardStatistics): number => {
    if (!overallStats) return 0
    const winRatio = overallStats.nbTrades > 0 ? overallStats.nbWin / overallStats.nbTrades : 0
    const pf = overallStats.grossLosses !== 0
        ? overallStats.grossWin / overallStats.grossLosses
        : overallStats.grossWin > 0 ? 100 : 0
    return calculateTradingScore({ winRate: winRatio * 100, profitFactor: pf, totalTrades: overallStats.nbTrades })
}

const formatHeroPnlValue = (pnl: number, mode: 'currency' | 'percent', totalAccountValue: number) => {
    const absValue = Math.abs(pnl)
    let mainStr = ""
    let decimalPart = ""

    if (mode === 'currency') {
        const formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const parts = formatted.split('.')
        mainStr = parts[0]
        decimalPart = parts[1]
    } else {
        const percentage = totalAccountValue > 0 ? (pnl / totalAccountValue) * 100 : 0
        const formatted = Math.abs(percentage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const parts = formatted.split('.')
        mainStr = parts[0]
        decimalPart = parts[1]
    }

    const charCount = mainStr.length
    let baseFontSize = "text-7xl md:text-8xl"
    if (charCount > 8) baseFontSize = "text-5xl md:text-6xl"
    else if (charCount > 6) baseFontSize = "text-6xl md:text-7xl"

    return { mainStr, decimalPart, baseFontSize }
}

const getTimeframeLabel = (timeframe: Timeframe): string => (timeframe === 'total' ? 'Lifetime' : timeframe)
const getDisplaySuffix = (mode: 'currency' | 'percent'): string => (mode === 'percent' ? '%' : '')
const getSignSymbol = (isPositive: boolean): string => (isPositive ? '+' : '-')
const getHeroWrapperClass = (isPositive: boolean): string => (isPositive ? "text-foreground" : "text-foreground/60")
const getHeroSignClass = (isPositive: boolean): string => (isPositive ? "text-foreground/60" : "text-foreground/20")

const getDisplayModeButtonClass = (mode: 'currency' | 'percent', currentMode: 'currency' | 'percent') => cn(
    "px-2.5 py-1 rounded-[6px] text-[10px] font-bold transition-all",
    mode === currentMode ? "bg-secondary/35 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
)

const getBlurCardClass = (isActive: boolean) => cn(
    "group border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-700 backdrop-blur-sm cursor-pointer relative overflow-hidden",
    isActive
        ? "bg-zinc-950/40 border-foreground/5 blur-xl scale-[0.98] select-none"
        : "bg-zinc-900/30 border-foreground/10 hover:bg-zinc-900/60 hover:border-foreground/20"
)

const getBlurIcon = (isActive: boolean): React.ReactElement => (
    isActive ? <Eye className="w-3 h-3 text-foreground/60" /> : <EyeOff className="w-3 h-3 text-foreground/40" />
)

const getStatTextClass = (value: number): string => (value >= 0 ? "text-foreground" : "text-foreground/40")

const formatIntervalDisplayValue = (
    value: number,
    displayMode: 'currency' | 'percent',
    totalAccountValue: number
) => {
    const numericValue = toSafeNumber(value)
    if (displayMode === 'currency') {
        return `$${numericValue.toLocaleString()}`
    }
    const percentValue = totalAccountValue > 0 ? ((numericValue / totalAccountValue) * 100).toFixed(2) : '0.00'
    return `${percentValue}%`
}

const getGoalTextClass = (value: number): string => (value < 0 ? "text-foreground/60" : "text-foreground")
const getGoalBarClass = (value: number): string => (value < 0 ? "bg-foreground/20 shadow-none" : "bg-gradient-to-r from-foreground/60 via-foreground/70 to-foreground/80 shadow-none")

const getDownloadLabel = (isExporting: boolean): string => (isExporting ? "Saving..." : "Download Image")

const getThemeButtonClass = (theme: Theme, isActive: boolean): string => cn(
    "w-2 h-2 rounded-full ml-1",
    theme.primary.replace('text-', 'bg-'),
    isActive ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-30 hover:opacity-100"
)

const syncHandleWithUser = (user: { email?: string } | undefined, setHandle: Dispatch<SetStateAction<string>>) => {
    if (!user?.email) return
    setHandle(user.email.split('@')[0].toUpperCase())
}

const resetBlurStates = (
    isOpen: boolean,
    setBlurWeekly: Dispatch<SetStateAction<boolean>>,
    setBlurMonthly: Dispatch<SetStateAction<boolean>>
) => {
    if (!isOpen) return
    setBlurWeekly(false)
    setBlurMonthly(false)
}

type EditableTargetProps = {
    customTarget: number
    isEditing: boolean
    onStartEditing: () => void
    onFinishEditing: (value: number | undefined) => void
}

const EditableTarget = ({ customTarget, isEditing, onStartEditing, onFinishEditing }: EditableTargetProps) => {
    if (isEditing) {
        return (
            <div className="flex items-baseline relative z-50">
                <span className="text-sm mr-1 text-foreground/60 font-bold">$</span>
                <input
                    autoFocus
                    type="number"
                    className="w-24 border-b border-foreground/40 bg-transparent text-sm font-bold text-foreground placeholder:text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                    defaultValue={customTarget}
                    onBlur={(e) => {
                        const val = parseFloat(e.target.value)
                        onFinishEditing(Number.isFinite(val) ? val : undefined)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                />
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={onStartEditing}
            className="text-sm font-bold text-foreground/90 transition-colors hover:text-foreground"
            aria-label="Edit total goal target"
        >
            ${customTarget.toLocaleString()}
        </button>
    )
}


export function DailySummaryModal() {
    const { calendarData, statistics: overallStats } = useDashboardStats()
    const accounts = useDashboardAccountsList()
    const user = useUserStore((state) => state.user)
    const [displayMode, setDisplayMode] = useState<'currency' | 'percent'>('currency')
    const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('obsidian')
    const [timeframe, setTimeframe] = useState<Timeframe>('daily')
    const [handle, setHandle] = useState('TRADER')
    const [isEditingHandle, setIsEditingHandle] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [customTarget, setCustomTarget] = useState(1000)
    const [isEditingTarget, setIsEditingTarget] = useState(false)
    const [blurWeekly, setBlurWeekly] = useState(false)
    const [blurMonthly, setBlurMonthly] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const cardRef = useRef<HTMLDivElement>(null)

    // Sync handle with user data
    useEffect(() => {
        syncHandleWithUser(user ?? undefined, setHandle)
    }, [user])

    // Reset blur when dialog opens
    useEffect(() => {
        resetBlurStates(isOpen, setBlurWeekly, setBlurMonthly)
    }, [isOpen])

    const theme = THEMES[currentTheme]

    const totalAccountValue = useMemo(() => {
        return accounts?.reduce((sum: number, acc: Account) => sum + (acc.metrics?.currentBalance || 0), 0) || 100000
    }, [accounts])

    const stats = useMemo(() => buildDailySummaryStats(calendarData), [calendarData])

    const heroPnlByTimeframe: Record<Timeframe, number> = {
        daily: stats.daily.pnl,
        weekly: stats.weekly.pnl,
        monthly: stats.monthly.pnl,
        total: stats.total.pnl,
    }

    const heroPnL = heroPnlByTimeframe[timeframe]
    const totalGoalPnl = toSafeNumber(stats.total.pnl)
    const totalGoalProgress = computeGoalProgress(totalGoalPnl, customTarget)
    const scoreVal = useMemo(() => calculateScoreValue(overallStats), [overallStats])
    const safeHeroPnL = toSafeNumber(heroPnL)
    const isPositive = safeHeroPnL >= 0
    const timeframeLabel = getTimeframeLabel(timeframe)
    const heroWrapperColor = getHeroWrapperClass(isPositive)
    const heroSignColor = getHeroSignClass(isPositive)
    const heroSignSymbol = getSignSymbol(isPositive)
    const heroSuffix = getDisplaySuffix(displayMode)
    const currencyButtonClass = getDisplayModeButtonClass('currency', displayMode)
    const percentButtonClass = getDisplayModeButtonClass('percent', displayMode)
    const weeklyBlurClass = getBlurCardClass(blurWeekly)
    const monthlyBlurClass = getBlurCardClass(blurMonthly)
    const weeklyIcon = getBlurIcon(blurWeekly)
    const monthlyIcon = getBlurIcon(blurMonthly)
    const weeklyStatColor = getStatTextClass(stats.weekly.pnl)
    const monthlyStatColor = getStatTextClass(stats.monthly.pnl)
    const weeklyValueText = formatIntervalDisplayValue(stats.weekly.pnl, displayMode, totalAccountValue)
    const monthlyValueText = formatIntervalDisplayValue(stats.monthly.pnl, displayMode, totalAccountValue)
    const goalTextClass = getGoalTextClass(totalGoalPnl)
    const goalBarClass = getGoalBarClass(totalGoalPnl)
    const downloadLabel = getDownloadLabel(isExporting)

    const handleDownload = () => downloadSummaryImage(cardRef.current, setIsExporting)

    const handleShare = () => {
        const currentCard = cardRef.current
        shareSummaryImage(
            currentCard,
            setIsExporting,
            () => downloadSummaryImage(currentCard, setIsExporting)
        )
    }

    const { mainStr, decimalPart, baseFontSize } = formatHeroPnlValue(safeHeroPnL, displayMode, totalAccountValue)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 flex border-border hover:bg-accent/50 bg-background/50 backdrop-blur-sm group h-10 items-center px-3 md:px-4">
                    <BarChart3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span className="hidden md:inline">PnL Summary</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl bg-transparent border-none shadow-none p-0 overflow-visible flex flex-col items-center [&>button]:hidden">
                <div className="sr-only">Trading Summary</div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full aspect-[7/4] bg-background text-foreground rounded-3xl overflow-hidden border border-border/60 relative flex flex-col sm:shadow-2xl"
                    ref={cardRef}
                >
                    {/* Refined Background Mesh */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-foreground/[0.08] via-transparent to-transparent opacity-50 pointer-events-none" />
                    <div className={cn("absolute inset-0 opacity-15 pointer-events-none blur-[40px] sm:blur-[80px]", theme.bgAccent)} />

                    <div className="relative z-10 flex-1 flex flex-col p-6 md:p-8">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-secondary/30 border border-border/60 flex items-center justify-center shadow-inner">
                                    <Zap className="w-5 h-5 text-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-lg tracking-tight text-foreground leading-none">
                                        QuntEdge
                                    </h3>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
                                        {format(new Date(), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    className="group flex items-center gap-2 cursor-pointer rounded-lg border border-transparent px-3 py-1.5 transition-all hover:border-border/60 hover:bg-secondary/30"
                                    onClick={(e) => { e.stopPropagation(); setIsEditingHandle(true); }}
                                    aria-label="Edit handle"
                                >
                                    {isEditingHandle ? (
                                        <input autoFocus className="w-24 border-none bg-transparent text-right text-xs font-bold uppercase tracking-wider text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={handle} onChange={(e) => setHandle(e.target.value)} onBlur={() => setIsEditingHandle(false)} />
                                    ) : (
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-wider transition-colors">@{handle}</span>
                                    )}
                                </button>
                                <div className="flex items-center bg-card rounded-lg p-0.5 border border-border/60">
                                    <button onClick={(e) => { e.stopPropagation(); setDisplayMode('currency'); }} className={currencyButtonClass}>$</button>
                                    <button onClick={(e) => { e.stopPropagation(); setDisplayMode('percent'); }} className={percentButtonClass}>%</button>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/30 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Close summary"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="flex-1 grid grid-cols-12 gap-8 items-stretch">

                            {/* Hero PnL */}
                            <div className="col-span-12 lg:col-span-7 flex flex-col h-full">
                                <div className="flex-1 flex flex-col justify-center items-center text-center">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{timeframeLabel} PnL</span>

                                        <div className="ml-auto flex items-center gap-2">
                                            <select
                                                className="cursor-pointer rounded bg-transparent text-[10px] font-bold uppercase text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={timeframe}
                                                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                                                aria-label="Summary timeframe"
                                            >
                                                <option value="daily" className="bg-popover text-popover-foreground">Daily</option>
                                                <option value="weekly" className="bg-popover text-popover-foreground">Weekly</option>
                                                <option value="monthly" className="bg-popover text-popover-foreground">Monthly</option>
                                                <option value="total" className="bg-popover text-popover-foreground">All</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "font-medium tracking-tighter flex items-baseline justify-center transition-colors duration-500 tabular-nums leading-none",
                                        baseFontSize,
                                        heroWrapperColor
                                    )}>
                                        <span className={cn("text-4xl md:text-5xl mr-2 font-normal opacity-100", heroSignColor)}>{heroSignSymbol}</span>
                                        {mainStr}
                                        <span className="text-3xl md:text-4xl opacity-50 ml-1 font-normal">.{decimalPart}{heroSuffix}</span>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                    className="grid grid-cols-2 gap-4 overflow-hidden"
                                >
                                     <motion.button
                                         type="button"
                                         onClick={() => setBlurWeekly(!blurWeekly)}
                                         aria-pressed={blurWeekly}
                                         className={weeklyBlurClass}
                                     >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {weeklyIcon}
                                        </div>
                                        <span className="text-[9px] text-fg-muted uppercase tracking-[0.15em] mb-1 font-bold group-hover:text-foreground/80 transition-colors">Weekly</span>
                                        <div className={cn("text-xl font-bold tracking-tight", weeklyStatColor)}>
                                            {weeklyValueText}
                                        </div>
                                     </motion.button>

                                     <motion.button
                                         type="button"
                                         onClick={() => setBlurMonthly(!blurMonthly)}
                                         aria-pressed={blurMonthly}
                                         className={monthlyBlurClass}
                                     >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {monthlyIcon}
                                        </div>
                                        <span className="text-[9px] text-fg-muted uppercase tracking-[0.15em] mb-1 font-bold group-hover:text-foreground/80 transition-colors">Monthly</span>
                                        <div className={cn("text-xl font-bold tracking-tight", monthlyStatColor)}>
                                            {monthlyValueText}
                                        </div>
                                     </motion.button>
                                </motion.div>
                            </div>

                            {/* Secondary Stats */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 h-full justify-center">
                                {/* Streak - Refined */}
                                <div className="flex-1 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 border border-foreground/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-foreground/20 transition-all">
                                    <div className="text-6xl font-black tracking-tighter text-foreground mb-2 relative z-10 drop-shadow-2xl">{stats.currentStreak}</div>
                                    <div className="text-[9px] text-fg-muted uppercase tracking-[0.3em] font-bold relative z-10">Win Streak</div>
                                    <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-foreground/[0.03] group-hover:text-foreground/[0.05] transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-900/30 border border-foreground/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-zinc-900/50 transition-colors backdrop-blur-sm">
                                        <div className="text-2xl font-black text-foreground/90 mb-1">{scoreVal}</div>
                                        <div className="text-[9px] text-fg-muted uppercase tracking-[0.2em] font-bold">Score</div>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-foreground/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-zinc-900/50 transition-colors backdrop-blur-sm">
                                        <div className="text-2xl font-black text-foreground/90 mb-1">{stats.winRate}%</div>
                                        <div className="text-[9px] text-fg-muted uppercase tracking-[0.2em] font-bold">Win Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Goal - Refined */}
                        <div className="mt-auto pt-8">
                            <div className="flex justify-between items-end mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-[0.2em]">Total Goal</span>
                                    <EditableTarget
                                        customTarget={customTarget}
                                        isEditing={isEditingTarget}
                                        onStartEditing={() => setIsEditingTarget(true)}
                                        onFinishEditing={(value) => {
                                            if (typeof value === 'number') setCustomTarget(value)
                                            setIsEditingTarget(false)
                                        }}
                                    />
                                </div>
                                <span className={cn("text-sm font-bold", goalTextClass)}>{Math.round(totalGoalProgress)}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-foreground/5 p-[1px] relative shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalGoalProgress}%` }}
                                    className={cn(
                                        "h-full rounded-full relative transition-all duration-700 ease-out",
                                        goalBarClass
                                    )}
                                >
                                    {/* Premium Shimmer Overlay */}
                                    <motion.div
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent w-[50%] skew-x-[-30deg]"
                                    />

                                    {/* Subtle Top Highlight */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-foreground/20 rounded-full" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-6 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                    <button className="text-xs font-medium uppercase tracking-wider text-foreground hover:underline decoration-foreground/30 underline-offset-4" onClick={handleDownload} disabled={isExporting} aria-label="Download summary image">
                        {downloadLabel}
                    </button>
                    <span className="text-foreground/20">•</span>
                    <button className="text-xs font-medium uppercase tracking-wider text-foreground hover:underline decoration-foreground/30 underline-offset-4" onClick={handleShare} disabled={isExporting} aria-label="Share summary image">
                        Share
                    </button>
                        {THEME_KEYS.map((themeKey) => (
                            <button
                                key={themeKey}
                                onClick={() => setCurrentTheme(themeKey)}
                                className={getThemeButtonClass(THEMES[themeKey], currentTheme === themeKey)}
                                aria-label={`Use ${THEMES[themeKey].name} theme`}
                            />
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
