import type { TradeItem } from "../../types/trader-profile"
import { TradeCard } from "./trade-card"

export function TradeFeed({ trades }: { trades: TradeItem[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--qe-panel))]/95 px-4 py-3">
        <div className="flex items-center gap-4">
          <p className="text-ui-title font-semibold text-foreground">My Trades</p>
          <p className="text-ui-title text-muted-foreground">Bookmarked</p>
        </div>
        <div className="flex items-center gap-2 text-ui-micro text-muted-foreground">
          <span className="rounded-md border border-border/70 bg-background/60 px-2 py-1 text-foreground">Recents</span>
          <span className="rounded-md border border-border/70 bg-background/60 px-2 py-1">Popular</span>
          <span className="rounded-md border border-border/70 bg-background/60 px-2 py-1">Profitable</span>
        </div>
      </div>

      {trades.map((trade, index) => (
        <TradeCard key={trade.id} trade={trade} showMenu={index === 2} />
      ))}
    </div>
  )
}
