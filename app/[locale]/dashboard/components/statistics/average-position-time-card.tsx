import { useData } from "@/context/data-provider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
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
  const { statistics: { averagePositionTime } } = useData()
  const t = useI18n()

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
        <Clock className="h-3 w-3 text-fg-muted" />
        <span className="font-black text-[11px] uppercase tracking-wider text-fg-primary">{averagePositionTime} Avg Time</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-3 w-3 text-fg-muted cursor-help" />
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