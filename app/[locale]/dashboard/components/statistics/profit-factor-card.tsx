import { useDashboardStats } from "@/context/data-provider"
import { Scale, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { WidgetSize } from '../../types/dashboard'
import { useI18n } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProfitFactorCardProps {
  size?: WidgetSize
}

export default function ProfitFactorCard({ size = 'medium' }: ProfitFactorCardProps) {
  const { statistics: { profitFactor } } = useDashboardStats()
  const t = useI18n()

  const safeProfitFactor = Number.isFinite(profitFactor) ? profitFactor : 0
  const formattedPF = safeProfitFactor.toFixed(2)
  const isProfitable = safeProfitFactor >= 1
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent px-2 py-1">
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          <Scale className={cn("h-4 w-4 shrink-0", isProfitable ? "metric-positive" : "metric-negative")} />
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/85">PF</span>
          <span className={cn("font-terminal shrink-0 text-center text-[24px] font-black leading-none tracking-tight", isProfitable ? "metric-positive" : "metric-negative")}>
            {formattedPF}
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className={cn("h-4 w-4 shrink-0 cursor-help", isProfitable ? "text-muted-foreground/70" : "text-fg-muted/50")} />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.profitFactor.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className={cn(
        "precision-panel flex items-center gap-1.5 px-3 py-1 rounded-md",
        isProfitable
          ? "bg-secondary/30 border-border/65"
          : "bg-secondary/22 border-border/55"
      )}>
        <Scale className={cn("h-3 w-3", isProfitable ? "metric-positive" : "metric-negative")} />
        <span className={cn(
          "font-terminal font-bold text-[11px] uppercase tracking-wider",
          isProfitable ? "metric-positive" : "metric-negative"
        )}>
          {formattedPF} PF
        </span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className={cn(
                "h-3 w-3 cursor-help",
                isProfitable ? "text-muted-foreground/70" : "text-fg-muted/50"
              )} />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={5}
              className="max-w-[300px]"
            >
              {t('widgets.profitFactor.tooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
