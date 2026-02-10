import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatTileProps {
  label: string
  value: string | number
  delta?: { value: string; direction: "up" | "down" | "neutral" }
  tone?: "default" | "positive" | "negative"
  className?: string
}

export function StatTile({ label, value, delta, tone = "default", className }: StatTileProps) {
  return (
    <div className={cn("rounded-lg border border-border/70 bg-card/60 p-3", className)}>
      <p className="text-ui-micro text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tracking-tight text-ui-display",
          tone === "positive" && "text-[hsl(var(--chart-win))]",
          tone === "negative" && "text-[hsl(var(--chart-loss))]",
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {delta ? (
        <p
          className={cn(
            "mt-1 text-ui-micro",
            delta.direction === "up" && "text-[hsl(var(--chart-win))]",
            delta.direction === "down" && "text-[hsl(var(--chart-loss))]",
            delta.direction === "neutral" && "text-muted-foreground",
          )}
        >
          {delta.value}
        </p>
      ) : null}
    </div>
  )
}
