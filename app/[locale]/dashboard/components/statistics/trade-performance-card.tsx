'use client'

import { useDashboardStats } from "@/context/data-provider"
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react"
import { WidgetSize } from '../../types/dashboard'
import { useI18n } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TradePerformanceCardProps {
  size?: WidgetSize
}

export default function TradePerformanceCard({ size = 'medium' }: TradePerformanceCardProps) {
  const { statistics: { nbWin, nbLoss, nbBe, nbTrades } } = useDashboardStats()
  const t = useI18n()

  // Calculate rates
  const toPercent = (value: number, total: number) => {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0
    return Number(((value / total) * 100).toFixed(2))
  }
  const winRate = toPercent(nbWin, nbTrades)
  const lossRate = toPercent(nbLoss, nbTrades)
  const beRate = toPercent(nbBe, nbTrades)
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent px-2 py-1">
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          <TrendingUp className="h-4 w-4 shrink-0 metric-positive" />
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/85">W/L</span>
          <span className="font-terminal shrink-0 text-center text-[18px] font-black leading-none tracking-tight text-foreground/95">
            {winRate}/{lossRate}
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 shrink-0 text-fg-muted cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.tradePerformance.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/30 border-border/65">
        <TrendingUp className="h-3 w-3 metric-positive" />
        <span className="font-terminal font-bold text-[11px] tabular-nums metric-positive">{winRate}%</span>
      </div>
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/22 border-border/55">
        <Minus className="h-3 w-3 text-muted-foreground/70" />
        <span className="font-terminal font-bold text-[11px] tabular-nums text-muted-foreground/70">{beRate}%</span>
      </div>
      <div className="precision-panel flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/22 border-border/55">
        <TrendingDown className="h-3 w-3 metric-negative" />
        <span className="font-terminal font-bold text-[11px] tabular-nums metric-negative">{lossRate}%</span>
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
            {t('widgets.tradePerformance.tooltip')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
