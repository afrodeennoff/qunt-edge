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
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <div className="h-full flex items-center justify-center p-2 bg-transparent">
        <div className="precision-panel flex w-full max-w-full items-center gap-2 rounded-md bg-secondary/30 border-border/65 px-3 py-1.5">
          <Award className="h-3.5 w-3.5 shrink-0 metric-positive" />
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/85">Streak</span>
          <span className="font-terminal min-w-0 flex-1 truncate text-right text-[18px] font-black leading-none tracking-tight metric-positive">{winningStreak}</span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.winningStreak.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

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
