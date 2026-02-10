import { MoreHorizontal, Repeat2, MessageCircle, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TradeItem } from "../../types/trader-profile"

export function TradeCard({ trade, showMenu = false }: { trade: TradeItem; showMenu?: boolean }) {
  const positive = trade.pnl >= 0

  return (
    <article className="rounded-2xl border border-border/70 bg-[hsl(var(--qe-panel))]/95 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[34px] font-semibold leading-none text-foreground">{trade.symbol}</p>
          <p className="mt-2 text-ui-body text-muted-foreground">
            {trade.date}{" "}
            <span className={cn("ml-2 font-medium", positive ? "text-[hsl(var(--chart-win))]" : "text-[hsl(var(--chart-loss))]")}>
              {positive ? `+$${Math.abs(trade.pnl).toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
            </span>
          </p>
          <p className="mt-2 text-ui-body text-muted-foreground">Risk: {trade.risk} &nbsp; Risk/Reward: {trade.ratio}</p>
        </div>

        <div className="text-right">
          <p className="text-ui-micro text-muted-foreground">{trade.status}</p>
          <p className="mt-1 text-ui-micro text-muted-foreground">UPD. 10H</p>
          <button type="button" className="mt-3 inline-flex size-7 items-center justify-center rounded-md border border-border/70 bg-background/60 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 h-20 rounded-lg border border-border/70 bg-background/50" />

      <div className="mt-3 flex items-center gap-3 text-muted-foreground">
        <Repeat2 className="size-4" />
        <MessageCircle className="size-4" />
        <Bookmark className="size-4" />
      </div>

      {showMenu ? (
        <div className="mt-3 inline-flex flex-col rounded-lg border border-border/70 bg-[hsl(var(--qe-surface-2))] p-1 text-ui-body text-foreground">
          <button type="button" className="rounded px-2 py-1 text-left hover:bg-foreground/5">Partial Exit</button>
          <button type="button" className="rounded px-2 py-1 text-left hover:bg-foreground/5">Full Exit</button>
          <button type="button" className="rounded px-2 py-1 text-left hover:bg-foreground/5">Average Down</button>
        </div>
      ) : null}
    </article>
  )
}
