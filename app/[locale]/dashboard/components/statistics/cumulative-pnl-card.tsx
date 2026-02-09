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
    <Card size={cardSize} variant="default" hover className="h-full flex flex-col">
      <CardContent className={cn("flex-1 flex flex-col justify-center space-y-4")}>
        {/* Main P&L Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-lg p-2 transition-colors",
              isPositive ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              {isPositive ? (
                <TrendingUp className={cn(iconSize, "text-green-500")} />
              ) : (
                <TrendingDown className={cn(iconSize, "text-red-500")} />
              )}
            </div>
            <span className={cn("font-semibold", textSizeClass, "text-muted-foreground")}>
              {t('statistics.profitLoss.net')}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className={cn("text-muted-foreground", size === 'tiny' ? "h-3 w-3" : "h-3.5 w-3.5")} />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.cumulativePnl.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Large Net P&L Value */}
        <div className={cn(
          "text-center font-bold font-mono",
          isPositive ? "text-green-500" : "text-red-500",
          valueSizeClass
        )}>
          {isPositive ? '+' : '-'}{formatCurrency(netPnl)}
        </div>

        {/* Breakdown */}
        <div className="space-y-2 border-t border-dashed pt-4">
          <div className={cn("flex justify-between items-center", textSizeClass)}>
            <span className="text-muted-foreground">{t('statistics.profitLoss.profits')}</span>
            <span className="font-medium text-green-500 font-mono">{formatCurrency(grossWin)}</span>
          </div>

          <div className={cn("flex justify-between items-center", textSizeClass)}>
            <span className="text-muted-foreground">- {t('statistics.profitLoss.losses')}</span>
            <span className="font-medium text-red-500 font-mono">{formatCurrency(grossLosses)}</span>
          </div>

          <div className={cn("flex justify-between items-center", textSizeClass)}>
            <span className="text-muted-foreground">- {t('statistics.profitLoss.fees')}</span>
            <span className="font-medium text-red-500 font-mono">{formatCurrency(cumulativeFees)}</span>
          </div>

          {nbPayouts > 0 && (
            <div className={cn("flex justify-between items-center", textSizeClass)}>
              <span className="text-muted-foreground">- {t('statistics.profitLoss.payouts')} ({nbPayouts})</span>
              <span className="font-medium text-red-500 font-mono">{formatCurrency(totalPayouts)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
