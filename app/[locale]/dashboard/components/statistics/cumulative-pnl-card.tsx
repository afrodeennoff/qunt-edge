import { useData } from "@/context/data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { WidgetSize } from '../../types/dashboard'
import { useI18n, useCurrentLocale } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CumulativePnlCardProps {
  size?: WidgetSize
}

export default function CumulativePnlCard({ size = 'medium' }: CumulativePnlCardProps) {
  const { statistics: { cumulativePnl, cumulativeFees, grossWin, grossLosses, totalPayouts, nbPayouts } } = useData()
  const netPnl = cumulativePnl - cumulativeFees - totalPayouts
  const isPositive = netPnl > 0
  const t = useI18n()
  const locale = useCurrentLocale()

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value))

    if (locale === 'fr') {
      return `${formatted} $`
    } else {
      return `$${formatted}`
    }
  }

  const cardSize = size === 'tiny' ? 'sm' : 'md'
  const textSizeClass = size === 'tiny' ? 'text-xs' : 'text-sm'
  const valueSizeClass = size === 'tiny' ? 'text-lg' : 'text-2xl'
  const iconSize = size === 'tiny' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className="h-full flex flex-col justify-center gap-3 p-4 bg-transparent relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "precision-panel p-1.5 rounded-md transition-all duration-500",
            isPositive ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"
          )}>
            {isPositive ? (
              <TrendingUp className={cn(iconSize, "metric-positive")} />
            ) : (
              <TrendingDown className={cn(iconSize, "metric-negative")} />
            )}
          </div>
          <span className="font-terminal text-[10px] font-bold uppercase tracking-widest text-fg-muted">
            {t('statistics.profitLoss.net')}
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-fg-muted" />
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
              {t('widgets.cumulativePnl.tooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className={cn(
        "text-center font-terminal font-bold tracking-tighter tabular-nums drop-shadow-2xl",
        isPositive ? "metric-positive" : "metric-negative",
        valueSizeClass === 'text-2xl' ? 'text-3xl' : 'text-xl'
      )}>
        {isPositive ? '+' : '-'}{formatCurrency(netPnl)}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 border-dashed">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-tight text-fg-muted">Profits</span>
          <span className="font-terminal text-[11px] font-bold text-white tabular-nums">{formatCurrency(grossWin)}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[9px] font-bold uppercase tracking-tight text-fg-muted">Losses</span>
          <span className="font-terminal text-[11px] font-bold metric-negative tabular-nums">{formatCurrency(grossLosses)}</span>
        </div>
      </div>
    </div>
  )
}
