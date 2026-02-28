import { useDashboardStats } from "@/context/data-provider"
import { Award, HelpCircle } from "lucide-react"
import { WidgetSize } from '../../types/dashboard'
import { useI18n } from '@/locales/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WinningStreakCardProps {
  size?: WidgetSize
}

export default function WinningStreakCard({ size = 'medium' }: WinningStreakCardProps) {
  const { statistics: { winningStreak } } = useDashboardStats()
  const t = useI18n()

  return (
    <div className="flex items-center justify-center h-full gap-2 p-2 bg-transparent">
      <div className="precision-panel flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/30 border-border/65">
        <Award className="h-3 w-3 metric-positive" />
        <span className="font-terminal font-bold text-[11px] uppercase tracking-wider metric-positive">{winningStreak} Trade Streak</span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-muted-foreground/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={5}
              className="max-w-[300px]"
            >
              {t('widgets.winningStreak.tooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
