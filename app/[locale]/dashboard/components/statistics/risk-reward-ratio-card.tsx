'use client'

import { useData } from "@/context/data-provider"
import { Card } from "@/components/ui/card"
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
  const { formattedTrades } = useData()
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

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 p-2 bg-transparent">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
        <Scale className="h-3 w-3 text-accent-teal" />
        <span className="font-black text-[11px] uppercase tracking-wider text-fg-primary">RR {riskRewardRatio}</span>
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
              {t('widgets.riskRewardRatio.tooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full px-4 py-1 cursor-pointer">
              <Progress
                value={profitPercentage}
                className="h-1 bg-white/5"
                indicatorClassName="bg-accent-teal shadow-[0_0_10px_rgba(var(--accent-teal-rgb),0.5)]"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            <div className="text-[10px] font-bold uppercase tracking-tight space-y-1">
              <div className="text-accent-teal">Avg. Win: ${avgWin.toFixed(2)}</div>
              <div className="text-rose-500">Avg. Loss: ${avgLoss.toFixed(2)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 
