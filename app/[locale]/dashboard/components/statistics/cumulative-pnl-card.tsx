import { useDashboardStats } from "@/context/data-provider"
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
import { WidgetShell } from "@/components/ui/widget-shell"

interface CumulativePnlCardProps {
  size?: WidgetSize
}

export default function CumulativePnlCard({ size = 'medium' }: CumulativePnlCardProps) {
  const { statistics } = useDashboardStats()
  const safeCumulativePnl = Number.isFinite(statistics.cumulativePnl) ? statistics.cumulativePnl : 0
  const safeCumulativeFees = Number.isFinite(statistics.cumulativeFees) ? statistics.cumulativeFees : 0
  const safeGrossWin = Number.isFinite(statistics.grossWin) ? statistics.grossWin : 0
  const safeGrossLosses = Number.isFinite(statistics.grossLosses) ? statistics.grossLosses : 0
  const safeTotalPayouts = Number.isFinite(statistics.totalPayouts) ? statistics.totalPayouts : 0
  const netPnl = safeCumulativePnl - safeCumulativeFees - safeTotalPayouts
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

  const valueSizeClass = size === 'tiny' ? 'text-lg' : 'text-2xl'
  const iconSize = size === 'tiny' ? 'h-4 w-4' : 'h-5 w-5'
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <WidgetShell
        className="h-full"
        contentClassName="flex h-full items-center justify-center px-2 py-1"
      >
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 shrink-0 metric-positive" />
          ) : (
            <TrendingDown className="h-4 w-4 shrink-0 metric-negative" />
          )}
          <span className="micro-sans shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/85">Net</span>
          <span className="micro-sans tabular-nums shrink-0 text-center text-[30px] font-black leading-none tracking-tight text-foreground/90">
            {isPositive ? '+' : '-'}{formatCurrency(netPnl)}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 shrink-0 text-muted-foreground/70 hover:text-muted-foreground/85 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.cumulativePnl.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      title={t('statistics.profitLoss.net')}
      icon={isPositive ? <TrendingUp className={cn(iconSize, "metric-positive")} /> : <TrendingDown className={cn(iconSize, "metric-negative")} />}
      info={t('widgets.cumulativePnl.tooltip')}
      className="h-full"
      contentClassName="flex flex-col justify-center gap-3 p-4"
    >
      <div className={cn(
        "text-center micro-sans font-black tracking-tight tabular-nums",
        isPositive ? "metric-positive" : "metric-negative",
        valueSizeClass === 'text-2xl' ? 'text-3xl' : 'text-xl'
      )}>
        {isPositive ? '+' : '-'}{formatCurrency(netPnl)}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/55 border-dashed">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/70">Profits</span>
          <span className="micro-sans text-[11px] font-bold text-foreground tabular-nums">{formatCurrency(safeGrossWin)}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/70">Losses</span>
          <span className="micro-sans text-[11px] font-bold metric-negative tabular-nums">{formatCurrency(safeGrossLosses)}</span>
        </div>
      </div>
    </WidgetShell>
  )
}
