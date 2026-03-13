'use client'

import { useDashboardStats } from '@/context/data-provider'
import { ArrowUpFromLine, ArrowDownFromLine, HelpCircle } from "lucide-react"
import { WidgetSize } from '../../types/dashboard'
import { useI18n } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WidgetShell } from "@/components/ui/widget-shell"

interface LongShortPerformanceCardProps {
  size?: WidgetSize
}

export default function LongShortPerformanceCard({ size = 'medium' }: LongShortPerformanceCardProps) {
  const { calendarData } = useDashboardStats()
  const t = useI18n()

  // Calculate long/short data
  const chartData = Object.entries(calendarData).map(([date, values]) => ({
    date,
    pnl: values.pnl,
    shortNumber: values.shortNumber,
    longNumber: values.longNumber,
  }))

  const longNumber = chartData.reduce((acc, curr) => acc + curr.longNumber, 0)
  const shortNumber = chartData.reduce((acc, curr) => acc + curr.shortNumber, 0)
  const totalTrades = longNumber + shortNumber
  const toPercent = (value: number, total: number) => {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0
    return Number(((value / total) * 100).toFixed(2))
  }
  const longRate = toPercent(longNumber, totalTrades)
  const shortRate = toPercent(shortNumber, totalTrades)
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <WidgetShell
        className="h-full"
        contentClassName="flex h-full items-center justify-center px-2 py-1"
      >
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          <ArrowUpFromLine className="h-4 w-4 shrink-0 metric-positive" />
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/85">L/S</span>
          <span className="font-terminal shrink-0 text-center text-[30px] font-black leading-none tracking-tight text-foreground/90">
            {longRate}/{shortRate}
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground/70 hover:text-muted-foreground/85 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.longShortPerformance.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      className="h-full"
      contentClassName="flex items-center justify-center h-full gap-2 p-2"
      info={t('widgets.longShortPerformance.tooltip')}
    >
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/30 border border-border/55">
        <ArrowUpFromLine className="h-3 w-3 metric-positive" />
        <span className="font-terminal font-bold text-[11px] tabular-nums metric-positive">{longNumber} ({longRate}%)</span>
      </div>
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/22 border border-border/55">
        <ArrowDownFromLine className="h-3 w-3 metric-negative" />
        <span className="font-terminal font-bold text-[11px] tabular-nums metric-negative">{shortNumber} ({shortRate}%)</span>
      </div>
    </WidgetShell>
  )
}
