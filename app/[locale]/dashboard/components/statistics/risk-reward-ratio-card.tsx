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
import { WidgetShell } from "@/components/ui/widget-shell"

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
      <WidgetShell
        className="h-full"
        contentClassName="flex h-full items-center justify-center px-2 py-1"
      >
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          <Scale className="h-4 w-4 shrink-0 text-foreground/90" />
          <span className="micro-sans shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/85">RR</span>
          <span className="micro-sans tabular-nums shrink-0 text-center text-[30px] font-black leading-none tracking-tight text-foreground/90">
            {riskRewardRatio.toFixed(2)}
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 shrink-0 cursor-help text-muted-foreground/70 hover:text-muted-foreground/85 transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.riskRewardRatio.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      title="Risk/Reward"
      icon={<Scale className="h-3.5 w-3.5 text-fg-muted" />}
      info={t('widgets.riskRewardRatio.tooltip')}
      className="h-full"
      contentClassName="flex flex-col justify-between gap-2 p-3"
    >
      <div className="flex items-end justify-center gap-2 px-1">
        <span className="micro-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/78">RR</span>
        <span className="micro-sans text-[24px] font-black leading-none tracking-tight text-foreground/90">
          {riskRewardRatio.toFixed(2)}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-muted-foreground/70">Avg Win</span>
          <span className="text-foreground/90">${avgWin.toFixed(2)}</span>
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
              <div className="micro-sans text-[10px] font-bold uppercase tracking-tight space-y-1">
                <div className="metric-positive">Avg. Win: ${avgWin.toFixed(2)}</div>
                <div className="metric-negative">Avg. Loss: ${avgLoss.toFixed(2)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </WidgetShell>
  )
}
