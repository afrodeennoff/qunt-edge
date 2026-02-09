"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Download, CheckCircle2, Award, Zap, Target, BarChart3, TrendingUp, Calendar, LayoutGrid, DollarSign, Percent, Palette, Globe, User, ShieldCheck, ArrowRightLeft, Clock, Edit2, Sparkles, Trophy, BadgeCheck, RefreshCw, Eye, EyeOff, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useData } from "@/context/data-provider"
import { startOfDay, startOfWeek, startOfMonth, endOfDay, parseISO, isWithinInterval, format } from "date-fns"
import { calculateTradingScore, getScoreColor, getScoreLabel } from "@/lib/score-calculator"
import { type Account } from "@/context/data-provider"
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
    vortex: { name: 'Vortex', primary: 'text-purple-400', glow: 'rgba(192,132,252,0.3)', bgAccent: 'bg-purple-600/20', pattern: 'radial-gradient(circle at 1.5px 1.5px, rgba(168,85,247,0.05) 1px, transparent 0)' },
    emerald: { name: 'Emerald', primary: 'text-emerald-400', glow: 'rgba(52,211,153,0.3)', bgAccent: 'bg-emerald-500/20', pattern: 'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)' },
    cyber: { name: 'Cyber', primary: 'text-cyan-400', glow: 'rgba(34,211,238,0.3)', bgAccent: 'bg-cyan-500/20', pattern: 'radial-gradient(rgba(6,182,212,0.05) 2px, transparent 0)' },
    luxury: { name: 'Luxury', primary: 'text-amber-400', glow: 'rgba(251,191,36,0.3)', bgAccent: 'bg-amber-600/10', pattern: 'repeating-linear-gradient(45deg, rgba(251,191,36,0.02) 0, rgba(251,191,36,0.02) 1px, transparent 0, transparent 50%)' }
}

export function DailySummaryModal() {
    const { calendarData, statistics: overallStats, accounts } = useData()
    const user = useUserStore((state) => state.user)
    const [selected, setSelected] = useState({
        hero: true,
        weekly: true,
        monthly: true,
        score: true,
        trend: true,
        winRate: true,
        target: true
    })
    const [displayMode, setDisplayMode] = useState<'currency' | 'percent'>('currency')
    const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('vortex')
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'total'>('daily')
    const [handle, setHandle] = useState('TRADER')
    const [isEditingHandle, setIsEditingHandle] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [customTarget, setCustomTarget] = useState(1000)
    const [isEditingTarget, setIsEditingTarget] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [blurWeekly, setBlurWeekly] = useState(false)
    const [blurMonthly, setBlurMonthly] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const cardRef = useRef<HTMLDivElement>(null)

    // Sync handle with user data
    useEffect(() => {
        if (user?.email) {
            setHandle(user.email.split('@')[0].toUpperCase())
        }
    }, [user])

    // Reset blur when dialog opens
    useEffect(() => {
        if (isOpen) {
            setBlurWeekly(false)
            setBlurMonthly(false)
        }
    }, [isOpen])

    const theme = THEMES[currentTheme]

    const totalAccountValue = useMemo(() => {
        return accounts?.reduce((sum: number, acc: Account) => sum + (acc.metrics?.currentBalance || 0), 0) || 100000
    }, [accounts])

    const stats = useMemo(() => {
        const today = new Date()
        const startDay = startOfDay(today)
        const startWeek = startOfWeek(today, { weekStartsOn: 1 })
        const startMonth = startOfMonth(today)
        const end = endOfDay(today)

        let daily = { pnl: 0, wins: 0, total: 0 }
        let weekly = { pnl: 0 }
        let monthly = { pnl: 0 }
        let total = { pnl: 0 }

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return format(d, 'yyyy-MM-dd')
        })

        const trendData = last7Days.map(dateStr => calendarData[dateStr]?.pnl || 0)

        // Calculate Streak
        let currentStreak = 0
        const sortedDates = Object.keys(calendarData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        const pastDates = sortedDates.filter(d => new Date(d) <= endOfDay(today))

        for (const dateStr of pastDates) {
            const pnl = calendarData[dateStr]?.pnl || 0
            if (pnl > 0) currentStreak++
            else if (pnl < 0) break
        }

        Object.entries(calendarData).forEach(([dateStr, data]) => {
            const date = parseISO(dateStr)

            if (isWithinInterval(date, { start: startDay, end })) {
                daily.pnl += (data.pnl || 0)
                daily.total += (data.tradeNumber || 0)
                if (data.trades) {
                    data.trades.forEach(t => {
                        if ((t.pnl || 0) > 0) daily.wins++
                    })
                }
            }
            if (isWithinInterval(date, { start: startWeek, end })) weekly.pnl += (data.pnl || 0)
            if (isWithinInterval(date, { start: startMonth, end })) monthly.pnl += (data.pnl || 0)
            total.pnl += (data.pnl || 0)
        })

        const winRate = daily.total > 0 ? Math.round((daily.wins / daily.total) * 100) : 0
        return { daily, weekly, monthly, total, winRate, trendData, currentStreak }
    }, [calendarData])

    const heroPnL = timeframe === 'daily' ? stats.daily.pnl
        : timeframe === 'weekly' ? stats.weekly.pnl
            : timeframe === 'monthly' ? stats.monthly.pnl
                : stats.total.pnl

    const totalGoalProgress = customTarget > 0
        ? Math.min(Math.max((stats.total.pnl / customTarget) * 100, 0), 100)
        : 0

    const scoreVal = useMemo(() => {
        if (!overallStats) return 0
        const winRatio = overallStats.nbTrades > 0 ? overallStats.nbWin / overallStats.nbTrades : 0
        const pf = overallStats.grossLosses !== 0 ? overallStats.grossWin / overallStats.grossLosses : overallStats.grossWin > 0 ? 100 : 0
        return calculateTradingScore({ winRate: winRatio * 100, profitFactor: pf, totalTrades: overallStats.nbTrades })
    }, [overallStats])

    const isPositive = heroPnL >= 0

    const handleDownload = async () => {
        if (!cardRef.current) return
        setIsExporting(true)
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#0a0a0a",
                scale: 2,
                logging: false,
                useCORS: true,
                width: cardRef.current.offsetWidth,
                height: cardRef.current.offsetHeight
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

    const handleShare = async () => {
        if (!cardRef.current) return
        setIsExporting(true)
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#0a0a0a",
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
                        handleDownload()
                    }
                } else {
                    handleDownload()
                }
            })
        } catch (err) {
            console.error("Failed to share image:", err)
        } finally {
            setIsExporting(false)
        }
    }

    const formatPnLWithScaling = (pnl: number, mode: 'currency' | 'percent') => {
        const absValue = Math.abs(pnl)
        let mainStr = ""; let decimalPart = ""
        if (mode === 'currency') {
            const formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            const parts = formatted.split('.'); mainStr = parts[0]; decimalPart = parts[1]
        } else {
            const percentage = totalAccountValue > 0 ? (pnl / totalAccountValue) * 100 : 0
            const formatted = Math.abs(percentage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            const parts = formatted.split('.'); mainStr = parts[0]; decimalPart = parts[1]
        }
        const charCount = mainStr.length
        let baseFontSize = "text-7xl md:text-8xl"
        if (charCount > 8) baseFontSize = "text-5xl md:text-6xl"
        else if (charCount > 6) baseFontSize = "text-6xl md:text-7xl"
        return { mainStr, decimalPart, baseFontSize }
    }

    const { mainStr, decimalPart, baseFontSize } = formatPnLWithScaling(heroPnL, displayMode)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 flex border-white/10 hover:bg-white/5 bg-zinc-950/50 backdrop-blur-sm group h-10 items-center px-3 md:px-4">
                    <BarChart3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span className="hidden md:inline">PnL Summary</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl bg-transparent border-none shadow-none p-0 overflow-visible flex flex-col items-center [&>button]:hidden">
                <div className="sr-only">Trading Summary</div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full aspect-[7/4] bg-[#050505] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col"
                    ref={cardRef}
                >
                    {/* Refined Background Mesh */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.08] via-transparent to-transparent opacity-50 pointer-events-none" />
                    <div className={cn("absolute inset-0 opacity-15 pointer-events-none blur-[80px]", theme.bgAccent)} />

                    <div className="relative z-10 flex-1 flex flex-col p-6 md:p-8">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                    <Zap className="w-5 h-5 text-white/90" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-lg tracking-tight text-white/90 leading-none">
                                        QuntEdge
                                    </h3>
                                    <div className="text-[10px] text-white/60 font-medium uppercase tracking-wider mt-1">
                                        {format(new Date(), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="group flex items-center gap-2 cursor-pointer transition-all hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5" onClick={(e) => { e.stopPropagation(); setIsEditingHandle(true); }}>
                                    {isEditingHandle ? (
                                        <input autoFocus className="bg-transparent border-none outline-none text-xs font-bold text-white text-right w-24 uppercase tracking-wider" value={handle} onChange={(e) => setHandle(e.target.value)} onBlur={() => setIsEditingHandle(false)} />
                                    ) : (
                                        <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider transition-colors">@{handle}</span>
                                    )}
                                </div>
                                <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-white/5">
                                    <button onClick={(e) => { e.stopPropagation(); setDisplayMode('currency'); }} className={cn("px-2.5 py-1 rounded-[6px] text-[10px] font-bold transition-all", displayMode === 'currency' ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white/60")}>$</button>
                                    <button onClick={(e) => { e.stopPropagation(); setDisplayMode('percent'); }} className={cn("px-2.5 py-1 rounded-[6px] text-[10px] font-bold transition-all", displayMode === 'percent' ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white/60")}>%</button>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
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
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                        <span className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">{timeframe === 'total' ? 'Lifetime' : timeframe} PnL</span>

                                        <div className="ml-auto flex items-center gap-2">
                                            <select className="bg-transparent text-[10px] uppercase font-bold text-white/10 outline-none cursor-pointer hover:text-white/40 transition-colors" value={timeframe} onChange={(e) => setTimeframe(e.target.value as any)}>
                                                <option value="daily" className="bg-zinc-950 text-white">Daily</option>
                                                <option value="weekly" className="bg-zinc-950 text-white">Weekly</option>
                                                <option value="monthly" className="bg-zinc-950 text-white">Monthly</option>
                                                <option value="total" className="bg-zinc-950 text-white">All</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "font-medium tracking-tighter flex items-baseline justify-center transition-colors duration-500 tabular-nums leading-none",
                                        baseFontSize,
                                        isPositive ? "text-emerald-400" : "text-rose-500"
                                    )}>
                                        <span className={cn("text-4xl md:text-5xl mr-2 font-normal opacity-100", isPositive ? "text-emerald-500/50" : "text-rose-500/50")}>{isPositive ? '+' : '-'}</span>
                                        {mainStr}
                                        <span className="text-3xl md:text-4xl opacity-50 ml-1 font-normal">.{decimalPart}{displayMode === 'percent' ? '%' : ''}</span>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                    className="grid grid-cols-2 gap-4 overflow-hidden"
                                >
                                    <motion.div
                                        onClick={() => setBlurWeekly(!blurWeekly)}
                                        className={cn(
                                            "group border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-700 backdrop-blur-sm cursor-pointer relative overflow-hidden",
                                            blurWeekly
                                                ? "bg-zinc-950/40 border-white/5 blur-xl scale-[0.98] select-none"
                                                : "bg-zinc-900/30 border-white/10 hover:bg-zinc-900/60 hover:border-white/20"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {blurWeekly ? <Eye className="w-3 h-3 text-white/40" /> : <EyeOff className="w-3 h-3 text-white/40" />}
                                        </div>
                                        <span className="text-[9px] text-white/60 uppercase tracking-[0.15em] mb-1 font-bold group-hover:text-white/80 transition-colors">Weekly</span>
                                        <div className={cn("text-xl font-bold tracking-tight", stats.weekly.pnl >= 0 ? "text-emerald-400" : "text-rose-500")}>
                                            {displayMode === 'currency' ? `$${stats.weekly.pnl.toLocaleString()}` : `${totalAccountValue > 0 ? ((stats.weekly.pnl / totalAccountValue) * 100).toFixed(2) : '0.00'}%`}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        onClick={() => setBlurMonthly(!blurMonthly)}
                                        className={cn(
                                            "group border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-700 backdrop-blur-sm cursor-pointer relative overflow-hidden",
                                            blurMonthly
                                                ? "bg-zinc-950/40 border-white/5 blur-xl scale-[0.98] select-none"
                                                : "bg-zinc-900/30 border-white/10 hover:bg-zinc-900/60 hover:border-white/20"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {blurMonthly ? <Eye className="w-3 h-3 text-white/40" /> : <EyeOff className="w-3 h-3 text-white/40" />}
                                        </div>
                                        <span className="text-[9px] text-white/60 uppercase tracking-[0.15em] mb-1 font-bold group-hover:text-white/80 transition-colors">Monthly</span>
                                        <div className={cn("text-xl font-bold tracking-tight", stats.monthly.pnl >= 0 ? "text-emerald-400" : "text-rose-500")}>
                                            {displayMode === 'currency' ? `$${stats.monthly.pnl.toLocaleString()}` : `${totalAccountValue > 0 ? ((stats.monthly.pnl / totalAccountValue) * 100).toFixed(2) : '0.00'}%`}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Secondary Stats */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 h-full justify-center">
                                {/* Streak - Refined */}
                                <div className="flex-1 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/20 transition-all">
                                    <div className="text-6xl font-black tracking-tighter text-white mb-2 relative z-10 drop-shadow-2xl">{stats.currentStreak}</div>
                                    <div className="text-[9px] text-white/60 uppercase tracking-[0.3em] font-bold relative z-10">Win Streak</div>
                                    <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-white/[0.03] group-hover:text-white/[0.05] transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-900/30 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-zinc-900/50 transition-colors backdrop-blur-sm">
                                        <div className="text-2xl font-black text-white/90 mb-1">{scoreVal}</div>
                                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Score</div>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-zinc-900/50 transition-colors backdrop-blur-sm">
                                        <div className="text-2xl font-black text-white/90 mb-1">{stats.winRate}%</div>
                                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Win Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Goal - Refined */}
                        <div className="mt-auto pt-8">
                            <div className="flex justify-between items-end mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Total Goal</span>
                                    {isEditingTarget ? (
                                        <div className="flex items-baseline relative z-50">
                                            <span className="text-sm mr-1 text-white/50 font-bold">$</span>
                                            <input
                                                autoFocus
                                                type="number"
                                                className="bg-transparent border-b border-white/20 outline-none text-white w-24 text-sm font-bold placeholder:text-white/20"
                                                defaultValue={customTarget}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value)
                                                    if (!isNaN(val)) setCustomTarget(val)
                                                    setIsEditingTarget(false)
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                                            />
                                        </div>
                                    ) : (
                                        <span onClick={() => setIsEditingTarget(true)} className="text-sm font-bold text-white/90 cursor-pointer hover:text-white transition-colors">
                                            ${customTarget.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <span className={cn("text-sm font-bold", stats.total.pnl < 0 ? "text-rose-500" : "text-emerald-400")}>{Math.round(totalGoalProgress)}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-[1px] relative shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalGoalProgress}%` }}
                                    className={cn(
                                        "h-full rounded-full relative transition-all duration-700 ease-out",
                                        stats.total.pnl < 0
                                            ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                                            : "bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                                    )}
                                >
                                    {/* Premium Shimmer Overlay */}
                                    <motion.div
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[50%] skew-x-[-30deg]"
                                    />

                                    {/* Subtle Top Highlight */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-white/20 rounded-full" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-6 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                    <button className="text-xs font-medium uppercase tracking-wider text-white hover:underline decoration-white/30 underline-offset-4" onClick={handleDownload} disabled={isExporting}>
                        {isExporting ? "Saving..." : "Download Image"}
                    </button>
                    <span className="text-white/20">•</span>
                    <button className="text-xs font-medium uppercase tracking-wider text-white hover:underline decoration-white/30 underline-offset-4" onClick={handleShare} disabled={isExporting}>
                        Share
                    </button>
                    {(['vortex', 'emerald', 'cyber', 'luxury'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setCurrentTheme(t)}
                            className={cn(
                                "w-2 h-2 rounded-full ml-1",
                                THEMES[t].primary.replace('text-', 'bg-'),
                                currentTheme === t ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "opacity-30 hover:opacity-100"
                            )}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function MetricCard({ label, value, active, theme, displayMode, totalValue }: { label: string, value: number, active: boolean, theme: Theme, displayMode: 'currency' | 'percent', totalValue: number }) {
    const isPos = value >= 0
    const displayValue = displayMode === 'currency'
        ? `${isPos ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : `${isPos ? '+' : '-'}${Math.abs(value / totalValue * 100).toFixed(1)}%`
    return (
        <div className={cn("p-4 rounded-2xl border transition-all duration-700 relative overflow-hidden group", active ? "bg-white/[0.04] border-white/10 backdrop-blur-md shadow-2xl" : "opacity-10 blur-sm scale-95 shadow-none")}>
            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40 group-hover:opacity-100 transition-opacity", isPos ? theme.primary.replace('text-', 'bg-') : "bg-red-500")} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-2.5 block group-hover:text-white/40 transition-colors">{label} Recap</span>
            <div className={cn("text-2xl font-black tracking-tighter tabular-nums", active ? (isPos ? theme.primary : "text-red-400") : "")}>{displayValue}</div>
        </div>
    )
}

function AnalysisBadge({ icon, label, value, theme, progress }: { icon: any, label: string, value: string | number, theme: Theme, progress: number }) {
    return (
        <div className="p-4 rounded-[2.2rem] border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500 shadow-xl backdrop-blur-lg">
            <div className="relative z-10">
                <div className="w-11 h-11 flex items-center justify-center mb-3 relative">
                    <svg className="w-full h-full transform -rotate-90 absolute">
                        <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                        <motion.circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={125.6} initial={{ strokeDashoffset: 125.6 }} animate={{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }} transition={{ duration: 2.5, ease: "circOut" }} className={theme.primary} />
                    </svg>
                    <div className={cn("relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]", theme.primary)}>{icon}</div>
                </div>
                <div className={cn("text-xl font-black tracking-tighter tabular-nums mb-1 leading-none shadow-sm", theme.primary)}>{value}</div>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20">{label}</span>
            </div>
        </div>
    )
}
