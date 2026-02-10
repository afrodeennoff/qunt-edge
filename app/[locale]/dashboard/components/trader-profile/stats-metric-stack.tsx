import { StatTile } from "@/components/ui/stat-tile"
import type { TraderStats } from "../../types/trader-profile"

export function StatsMetricStack({ stats }: { stats: TraderStats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile label="AVG. WIN" value={`${stats.avgWin}%`} tone="positive" />
      <StatTile label="AVG. LOSS" value={`${stats.avgLoss}%`} tone="negative" />
      <StatTile label="AVG. RETURN" value={`${stats.avgReturn}%`} />
      <StatTile label="WIN RATE" value={`${stats.winRate}%`} tone="positive" />
    </div>
  )
}
