'use client'

import { useDashboardStats } from "@/context/data-provider"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WidgetSize } from '../../types/dashboard'
import { Scale, HelpCircle } from "lucide-react"
import { useI18n } from '@/locales/client'
import { useMemo } from "react"

interface RiskRewardRatioCardProps {
  size?: WidgetSize
}

export default function RiskRewardRatioCard({ size = 'tiny' }: RiskRewardRatioCardProps) {
  const { formattedTrades } = useDashboardStats()
  const t = useI18n()

  const { avgWin, avgLoss, riskRewardRatio, profitPercentage } = useMemo(() => {
    // Filter winning and losing trades
    const winningTrades = formattedTrades.filter(trade => Number(trade.pnl) > 0)
    const losingTrades = formattedTrades.filter(trade => Number(trade.pnl) < 0)

    // Calculate averages
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0) / winningTrades.length
      : 0

    const avgLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0) / losingTrades.length
      : 0

    // Calculate Risk-Reward ratio
    const riskRewardRatio = Math.abs(avgLoss) > 0
      ? Number((avgWin / Math.abs(avgLoss)).toFixed(2))
      : 0

    // Calculate progress percentage for visualization
    const totalValue = Math.abs(avgLoss) + Math.abs(avgWin)
    const profitPercentage = totalValue > 0
      ? (Math.abs(avgWin) / totalValue) * 100
      : 50

    return { avgWin, avgLoss, riskRewardRatio, profitPercentage }
  }, [formattedTrades])

  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent px-2 py-1">
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          <Scale className="h-4 w-4 shrink-0 text-foreground/95" />
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/85">RR</span>
          <span className="font-terminal shrink-0 text-center text-[24px] font-black leading-none tracking-tight text-foreground/95">
            {riskRewardRatio.toFixed(2)}
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 shrink-0 cursor-help text-muted-foreground/70" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.riskRewardRatio.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col justify-between gap-2 p-3 bg-transparent">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border/55 bg-secondary/22 px-2.5 py-1">
          <Scale className="h-3.5 w-3.5 text-foreground/95" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/85">Risk/Reward</span>
        </div>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
              {t('widgets.riskRewardRatio.tooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-end justify-center gap-2 px-1">
        <span className="font-terminal text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">RR</span>
        <span className="font-terminal text-[24px] font-black leading-none tracking-tight text-foreground/95">
          {riskRewardRatio.toFixed(2)}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-muted-foreground/70">Avg Win</span>
          <span className="text-foreground/95">${avgWin.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-muted-foreground/70">Avg Loss</span>
          <span className="text-muted-foreground/85">${avgLoss.toFixed(2)}</span>
        </div>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full cursor-pointer">
                <Progress
                  value={profitPercentage}
                  className="h-1.5 bg-secondary/22"
                  indicatorClassName="bg-white chart-positive-emphasis"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5}>
              <div className="font-terminal text-[10px] font-bold uppercase tracking-tight space-y-1">
                <div className="metric-positive">Avg. Win: ${avgWin.toFixed(2)}</div>
                <div className="metric-negative">Avg. Loss: ${avgLoss.toFixed(2)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 
