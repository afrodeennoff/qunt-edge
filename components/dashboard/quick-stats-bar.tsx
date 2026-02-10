import { MetricCard, MetricCardProps } from "./metric-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface QuickStatsBarProps {
  stats: MetricCardProps[]
  className?: string
  layout?: 'grid' | 'scroll' | 'stack' // Responsive hint
}

export function QuickStatsBar({ stats, className, layout = 'scroll' }: QuickStatsBarProps) {

  // Mobile/Compact View: Horizontal Scroll
  if (layout === 'scroll') {
    return (
      <ScrollArea className={cn("w-full whitespace-nowrap bg-panel border-b border-border-subtle", className)}>
        <div className="flex p-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="w-[200px] shrink-0">
              <MetricCard {...stat} variant="compact" />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  }

  // Desktop View: Grid
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4", className)}>
      {stats.map((stat, i) => (
        <MetricCard key={i} {...stat} variant="default" />
      ))}
    </div>
  )
}
