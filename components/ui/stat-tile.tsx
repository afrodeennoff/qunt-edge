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
    <div className={cn("rounded-xl border border-white/10 bg-black/25 p-3", className)}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">{label}</p>
      <p
        className={cn("mt-1 text-2xl font-black", {
          "text-fg-primary": tone === "default",
          "text-emerald-400": tone === "positive",
          "text-rose-400": tone === "negative",
        })}
      >
        {value}
      </p>
      {delta ? (
        <p
          className={cn("mt-1 text-[10px] font-semibold uppercase tracking-wide", {
            "text-emerald-400": delta.direction === "up",
            "text-rose-400": delta.direction === "down",
            "text-fg-muted": delta.direction === "neutral",
          })}
        >
          {delta.value}
        </p>
      ) : null}
    </div>
  )
}
