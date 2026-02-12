'use client'

import { useData } from '@/context/data-provider'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeftRight, ArrowUpFromLine, ArrowDownFromLine, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { WidgetSize } from '../../types/dashboard'
import { useI18n } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LongShortPerformanceCardProps {
  size?: WidgetSize
}

export default function LongShortPerformanceCard({ size = 'medium' }: LongShortPerformanceCardProps) {
  const { calendarData } = useData()
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
  const longRate = Number((longNumber / totalTrades * 100).toFixed(2))
  const shortRate = Number((shortNumber / totalTrades * 100).toFixed(2))

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent-teal/10 border-accent-teal/20">
        <ArrowUpFromLine className="h-3 w-3 text-accent-teal" />
        <span className="font-terminal font-bold text-[11px] tabular-nums text-accent-teal">{longNumber} ({longRate}%)</span>
      </div>
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border-rose-500/20">
        <ArrowDownFromLine className="h-3 w-3 text-rose-500" />
        <span className="font-terminal font-bold text-[11px] tabular-nums text-rose-500">{shortNumber} ({shortRate}%)</span>
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3 w-3 text-fg-muted cursor-help" />
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={5}
            className="max-w-[300px]"
          >
            {t('widgets.longShortPerformance.tooltip')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
