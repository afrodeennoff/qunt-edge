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
import { WidgetShell } from "@/components/ui/widget-shell"

interface WinningStreakCardProps {
  size?: WidgetSize
}

export default function WinningStreakCard({ size = 'medium' }: WinningStreakCardProps) {
  const { statistics: { winningStreak } } = useDashboardStats()
  const t = useI18n()
  const isCompact = size === 'tiny' || size === 'small' || size === 'small-long'

  if (isCompact) {
    return (
      <WidgetShell
        className="h-full"
        contentClassName="flex h-full items-center justify-center px-2 py-1"
      >
        <div className="mx-auto inline-flex items-center justify-center gap-2.5 text-center">
          <Award className="h-4 w-4 shrink-0 metric-positive" />
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/85">Streak</span>
          <span className="font-terminal shrink-0 text-center text-[30px] font-black leading-none tracking-tight text-foreground/90">{winningStreak}</span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground/70 hover:text-muted-foreground/85 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[300px]">
                {t('widgets.winningStreak.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      className="h-full"
      contentClassName="flex items-center justify-center h-full gap-2 p-2"
      info={t('widgets.winningStreak.tooltip')}
    >
      <div className="precision-panel flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/30 border-border/55">
        <Award className="h-3 w-3 metric-positive" />
        <span className="font-terminal font-bold text-[11px] uppercase tracking-wider metric-positive">{winningStreak} Trade Streak</span>
      </div>
    </WidgetShell>
  )
}
