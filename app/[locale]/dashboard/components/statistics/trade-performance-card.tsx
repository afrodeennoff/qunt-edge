'use client'

import { useData } from "@/context/data-provider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
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
  const { statistics: { nbWin, nbLoss, nbBe, nbTrades } } = useData()
  const t = useI18n()

  // Calculate rates
  const winRate = Number((nbWin / nbTrades * 100).toFixed(2))
  const lossRate = Number((nbLoss / nbTrades * 100).toFixed(2))
  const beRate = Number((nbBe / nbTrades * 100).toFixed(2))

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent-teal/10 rounded-md border border-accent-teal/20">
        <TrendingUp className="h-3 w-3 text-accent-teal" />
        <span className="font-black text-[11px] tabular-nums text-accent-teal">{winRate}%</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
        <Minus className="h-3 w-3 text-fg-muted" />
        <span className="font-black text-[11px] tabular-nums text-fg-muted">{beRate}%</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 rounded-md border border-rose-500/20">
        <TrendingDown className="h-3 w-3 text-rose-500" />
        <span className="font-black text-[11px] tabular-nums text-rose-500">{lossRate}%</span>
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
