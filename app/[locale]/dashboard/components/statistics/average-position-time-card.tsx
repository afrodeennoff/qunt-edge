import { useDashboardStats } from "@/context/data-provider"
import { Clock } from "lucide-react"
import { WidgetSize } from '../../types/dashboard'
import { useI18n } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface AveragePositionTimeCardProps {
  size?: WidgetSize
}

export default function AveragePositionTimeCard({ size = 'medium' }: AveragePositionTimeCardProps) {
  const { statistics: { averagePositionTime } } = useDashboardStats()
  const t = useI18n()
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent px-2 py-1 overflow-hidden">
        <div className="mx-auto inline-flex max-w-full items-center justify-center gap-2 text-center">
          <Clock className="h-4 w-4 shrink-0 metric-positive" />
          <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground/85 whitespace-nowrap">Avg Time</span>
          <span className="font-terminal shrink-0 whitespace-nowrap text-center text-[26px] font-black leading-none tracking-tight text-foreground/95">{averagePositionTime}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground/70 hover:text-muted-foreground/85 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.averagePositionTime.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className="precision-panel flex items-center gap-1.5 px-3 py-1 rounded-md">
        <Clock className="h-3 w-3 metric-positive" />
        <span className="font-terminal font-bold text-[11px] uppercase tracking-wider metric-positive">{averagePositionTime} Avg Time</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-3 w-3 text-muted-foreground/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={5}
              className="max-w-[300px]"
            >
              {t('widgets.averagePositionTime.tooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
