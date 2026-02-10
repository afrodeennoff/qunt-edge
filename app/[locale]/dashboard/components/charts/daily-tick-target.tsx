"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, HelpCircle, Plus, Minus, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { WidgetSize } from '@/app/[locale]/dashboard/types/dashboard'
import { Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/locales/client"
import { useData } from "@/context/data-provider"
import { useDailyTickTargetStore } from "@/store/daily-tick-target-store"
import { useTickDetailsStore } from "@/store/tick-details-store"
import { useEffect, useState } from "react"

interface DailyTickTargetProps {
  size?: WidgetSize
}

export default function DailyTickTargetChart({ size = 'medium' }: DailyTickTargetProps) {
  const { formattedTrades: trades, dateRange } = useData()
  const t = useI18n()
  const tickDetails = useTickDetailsStore(state => state.tickDetails)
  const [targetValue, setTargetValue] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // Add selectedDate state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  const {
    getTodayTarget,
    getTodayProgress,
    setTarget,
    updateCurrent,
    displayMode,
    setDisplayMode,
    convertToDisplayValue,
    convertFromDisplayValue,
    getDisplayUnit,
    getTarget, // Added getTarget
    getProgress // Added getProgress
  } = useDailyTickTargetStore()

  // Use selectedDate for fetching progress
  const todayTarget = getTarget(selectedDate)
  const progress = getProgress(selectedDate) || { current: 0, target: 0, percentage: 0, positive: 0, negative: 0, total: 0 }

  // Calculate current day's ticks from trades
  useEffect(() => {
    // Determine display date/range based on date filter or today
    let fromDate: string
    let toDate: string

    if (dateRange && dateRange.from) {
      // If there's a date filter, use the date range
      // Use local date formatting to avoid timezone issues
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      fromDate = formatLocalDate(dateRange.from)
      toDate = dateRange.to ? formatLocalDate(dateRange.to) : fromDate
    } else {
      // No date filter, use today's date
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayStr = `${year}-${month}-${day}`
      fromDate = todayStr
      toDate = todayStr
    }

    // Use the from date as the selected date for storage
    setSelectedDate(fromDate)

    // Filter trades for the selected period (even if trades array is empty)
    const displayTrades = trades.filter(trade => {
      // Validate that entryDate exists and is valid
      if (!trade.entryDate) return false

      const entryDate = new Date(trade.entryDate)
      if (isNaN(entryDate.getTime())) return false

      const tradeDate = entryDate.toISOString().split('T')[0]
      // Check if trade date is within the range
      return tradeDate >= fromDate && tradeDate <= toDate
    })

    // Calculate ticks breakdown for the period (even if no trades)
    let totalTicks = 0
    let positiveTicks = 0
    let negativeTicks = 0
    let totalAbsoluteTicks = 0

    if (displayTrades.length > 0) {
      displayTrades.forEach(trade => {
        // Validate required fields
        if (!trade.pnl || !trade.quantity || !trade.instrument) return

        // Fix ticker matching logic - sort by length descending to match longer tickers first
        const matchingTicker = Object.keys(tickDetails)
          .sort((a, b) => b.length - a.length)
          .find(ticker => trade.instrument.includes(ticker))

        // Use tickValue (monetary value per tick) instead of tickSize (minimum price increment)
        const tickValue = matchingTicker ? tickDetails[matchingTicker].tickValue : 1

        // Calculate PnL per contract first
        const pnlPerContract = Number(trade.pnl) / Number(trade.quantity)
        if (isNaN(pnlPerContract)) return

        const ticks = Math.round(pnlPerContract / Number(tickValue))
        if (!isNaN(ticks)) {
          totalTicks += ticks
          totalAbsoluteTicks += Math.abs(ticks)

          if (ticks > 0) {
            positiveTicks += ticks
          } else {
            negativeTicks += ticks
          }
        }
      })
    }

    // Always update current ticks for the period with breakdown (even if zero)
    updateCurrent(fromDate, totalTicks, positiveTicks, negativeTicks, totalAbsoluteTicks)
  }, [trades, tickDetails, updateCurrent, dateRange])

  const handleSaveTarget = () => {
    const targetDate = selectedDate
    const displayValue = parseInt(targetValue) || 0
    const tickValue = convertFromDisplayValue(displayValue)
    setTarget(targetDate, tickValue)
    setTargetValue('')
    setIsDialogOpen(false)
  }

  const handleQuickIncrement = (increment: number) => {
    const targetDate = selectedDate
    const currentTarget = todayTarget?.target || 0
    const displayIncrement = convertFromDisplayValue(increment)
    const newTarget = Math.max(0, currentTarget + displayIncrement)
    setTarget(targetDate, newTarget)
  }

  const isTargetSet = todayTarget && todayTarget.target > 0
  const isOverTarget = progress.current > progress.target && progress.target > 0

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div
        className={cn(
          "flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0",
          size === "small" ? "p-2 h-10 justify-center" : "p-3 sm:p-4 h-14 justify-center"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base"
              )}
            >
              {t("widgets.dailyTickTarget.title")}
            </span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={cn(
                      "text-fg-muted hover:text-fg-primary transition-colors cursor-help",
                      size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t("widgets.dailyTickTarget.tooltip")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

            {/* Points/Ticks Toggle */}
            <div className="flex items-center gap-2 ml-2">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 p-1 rounded-md bg-white/5 border border-white/5">
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors",
                          displayMode === "ticks" ? "text-accent-teal" : "text-fg-muted hover:text-fg-secondary"
                        )}
                        onClick={() => setDisplayMode("ticks")}
                      >
                        {t("widgets.dailyTickTarget.displayMode.ticks")}
                      </span>
                      <div className="h-3 w-[1px] bg-white/10" />
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors",
                          displayMode === "points" ? "text-accent-teal" : "text-fg-muted hover:text-fg-secondary"
                        )}
                        onClick={() => setDisplayMode("points")}
                      >
                        {t("widgets.dailyTickTarget.displayMode.points")}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{t("widgets.dailyTickTarget.displayMode.tooltip")}</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Target controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickIncrement(-1)}
              className="h-6 w-6 p-0 hover:bg-white/5 text-fg-muted hover:text-fg-primary rounded-full transition-colors"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickIncrement(1)}
              className="h-6 w-6 p-0 hover:bg-white/5 text-fg-muted hover:text-fg-primary rounded-full transition-colors"
            >
              <Plus className="h-3 w-3" />
            </Button>

            {/* Target setting dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent-teal/10 text-fg-muted hover:text-accent-teal rounded-full transition-colors"
                >
                  <Target className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-fg-primary">{t("widgets.dailyTickTarget.setTarget")}</DialogTitle>
                  <DialogDescription className="text-fg-secondary">
                    {t("widgets.dailyTickTarget.setTargetDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-fg-secondary">
                      {t("widgets.dailyTickTarget.target")} (
                      {displayMode === "points"
                        ? t("widgets.dailyTickTarget.displayMode.points")
                        : t("widgets.dailyTickTarget.displayMode.ticks")}
                      )
                    </label>
                    <Input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder={Math.round(convertToDisplayValue(progress.target)).toString()}
                      className="bg-white/5 border-white/10 text-fg-primary placeholder:text-fg-muted focus:border-accent-teal/50 focus:ring-accent-teal/20 transition-all"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/10 hover:bg-white/5 text-fg-secondary">
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSaveTarget} className="bg-accent-teal hover:bg-accent-teal/90 text-white font-bold">
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === "small" ? "p-1" : "p-2 sm:p-4"
        )}
      >
        <div className="w-full h-full flex flex-col justify-center gap-4">
          {/* Current vs Target Display */}
          <div className="flex items-center justify-around w-full px-4 py-2 bg-white/5 rounded-lg border border-white/5">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-fg-muted uppercase tracking-widest font-bold",
                  size === "small" ? "text-[10px]" : "text-[11px]"
                )}
              >
                {t("widgets.dailyTickTarget.current")}
              </span>
              <span
                className={cn(
                  "font-black tracking-tight tabular-nums",
                  progress.current >= progress.target && progress.target > 0 ? "text-accent-teal drop-shadow-[0_0_10px_rgba(var(--accent-teal-rgb),0.3)]" : "text-fg-primary",
                  size === "small" ? "text-2xl" : "text-4xl"
                )}
              >
                {Math.round(convertToDisplayValue(progress.current))}
                <span className="text-sm font-bold ml-1 text-fg-muted uppercase opacity-50">
                  {getDisplayUnit()}
                  {progress.current !== 1 ? "s" : ""}
                </span>
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-fg-muted uppercase tracking-widest font-bold",
                  size === "small" ? "text-[10px]" : "text-[11px]"
                )}
              >
                {t("widgets.dailyTickTarget.target")}
              </span>
              <span
                className={cn(
                  "font-black tracking-tight tabular-nums text-fg-secondary",
                  size === "small" ? "text-2xl" : "text-4xl"
                )}
              >
                {Math.round(convertToDisplayValue(progress.target))}
                <span className="text-sm font-bold ml-1 text-fg-muted uppercase opacity-50">
                  {getDisplayUnit()}
                  {progress.target !== 1 ? "s" : ""}
                </span>
              </span>
            </div>
          </div>

          {/* Breakdown Display */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="flex items-center justify-between px-3 py-2 bg-accent-teal/5 border border-accent-teal/10 rounded-lg">
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider text-accent-teal/70",
                  )}
                >
                  {t("widgets.dailyTickTarget.positive")}
                </span>
                <span
                  className={cn(
                    "font-black text-accent-teal tabular-nums",
                    size === "small" ? "text-sm" : "text-lg"
                  )}
                >
                  +{Math.round(convertToDisplayValue(progress.positive))}
                </span>
              </div>
              <ArrowUp className="h-4 w-4 text-accent-teal/50" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider text-rose-500/70",
                  )}
                >
                  {t("widgets.dailyTickTarget.negative")}
                </span>
                <span
                  className={cn(
                    "font-black text-rose-500 tabular-nums",
                    size === "small" ? "text-sm" : "text-lg"
                  )}
                >
                  {Math.round(convertToDisplayValue(progress.negative))}
                </span>
              </div>
              <ArrowDown className="h-4 w-4 text-rose-500/50" />
            </div>
          </div>

          {/* Progress Bar */}
          {isTargetSet && (
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center">
                <span
                  className={cn(
                    "text-fg-muted text-[10px] uppercase font-bold tracking-wider",
                  )}
                >
                  {t("widgets.dailyTickTarget.progress")}
                </span>
                <span
                  className={cn(
                    "font-black tabular-nums",
                    isOverTarget ? "text-accent-teal" : "text-fg-primary",
                    size === "small" ? "text-xs" : "text-sm"
                  )}
                >
                  {Math.round(progress.percentage)}%
                </span>
              </div>
              <Progress
                value={progress.percentage}
                className={cn(
                  "h-1.5 bg-white/5",
                  isOverTarget ? "bg-accent-teal/20" : ""
                )}
                indicatorClassName={cn(
                  isOverTarget ? "bg-accent-teal shadow-[0_0_10px_rgba(var(--accent-teal-rgb),0.5)]" : "bg-fg-secondary"
                )}
              />
            </div>
          )}

          {/* No target set message */}
          {!isTargetSet && (
            <div className="flex flex-col items-center gap-2 text-center py-2 opacity-50">
              <Target className="h-6 w-6 text-fg-muted" />
              <span
                className={cn(
                  "text-fg-muted font-medium",
                  size === "small" ? "text-xs" : "text-sm"
                )}
              >
                {t("widgets.dailyTickTarget.noTargetSet")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

