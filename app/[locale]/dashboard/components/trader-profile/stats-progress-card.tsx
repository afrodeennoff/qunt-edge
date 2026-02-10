import { Card } from "@/components/ui/card"
import type { TraderStats } from "../../types/trader-profile"

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-ui-body text-muted-foreground">{label}</p>
        <p className="text-ui-body font-semibold text-foreground">{value}%</p>
      </div>
      <div className="h-2 rounded-full bg-background/70">
        <div className="h-2 rounded-full bg-[hsl(var(--chart-6))]" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
    </div>
  )
}

export function StatsProgressCard({ stats }: { stats: TraderStats }) {
  return (
    <Card className="border border-border/70 bg-[hsl(var(--qe-panel))]/95 p-4">
      <div className="space-y-4">
        <ProgressRow label="WIN RATE" value={stats.winRate} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/70 bg-background/50 p-3">
            <p className="text-ui-micro text-muted-foreground">TOTAL TRADES</p>
            <p className="mt-1 text-ui-display font-semibold text-foreground">{stats.totalTrades}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 p-3">
            <p className="text-ui-micro text-muted-foreground">SERIAL TRADER</p>
            <p className="mt-1 text-ui-display font-semibold text-foreground">{stats.serialTraderScore}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 p-3">
            <p className="text-ui-micro text-muted-foreground">BREAK EVEN RATE</p>
            <p className="mt-1 text-ui-display font-semibold text-foreground">{stats.breakEvenRate}%</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 p-3">
            <p className="text-ui-micro text-muted-foreground">SUM GAIN</p>
            <p className="mt-1 text-ui-display font-semibold text-foreground">{stats.sumGain}%</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
