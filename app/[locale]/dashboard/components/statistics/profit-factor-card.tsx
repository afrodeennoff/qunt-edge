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
  void size
  const { statistics: { profitFactor } } = useDashboardStats()
  const t = useI18n()

  const safeProfitFactor = Number.isFinite(profitFactor) ? profitFactor : 0
  const formattedPF = safeProfitFactor.toFixed(2)
  const isProfitable = safeProfitFactor >= 1

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
