import { useData } from "@/context/data-provider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
  const { statistics: { profitFactor } } = useData()
  const t = useI18n()

  const formattedPF = profitFactor.toFixed(2)
  const isProfitable = profitFactor >= 1

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full border",
        isProfitable
          ? "bg-accent-teal/10 border-accent-teal/20"
          : "bg-rose-500/10 border-rose-500/20"
      )}>
        <Scale className={cn("h-3 w-3", isProfitable ? "text-accent-teal" : "text-rose-500")} />
        <span className={cn(
          "font-black text-[11px] uppercase tracking-wider",
          isProfitable ? "text-accent-teal" : "text-rose-500"
        )}>
          {formattedPF} PF
        </span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className={cn(
                "h-3 w-3 cursor-help",
                isProfitable ? "text-accent-teal/50" : "text-rose-500/50"
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