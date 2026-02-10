import { BrainCircuit } from "lucide-react"
import { Card } from "@/components/ui/card"

const CHAT = [
  {
    role: "user",
    text: "Give me a forecast for the SUI coin",
    time: "15:01",
  },
  {
    role: "assistant",
    text: "SUI is trading near $7.55 with +2.8% in 24h. Short-term momentum appears bullish based on recent inflows.",
    time: "15:01",
  },
]

export function AssistantPanel() {
  return (
    <Card className="h-full border border-border/80 bg-[hsl(var(--qe-panel))]/95 p-0">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h3 className="text-ui-title font-semibold text-foreground">AI Assistant</h3>
        <BrainCircuit className="size-4 text-muted-foreground" />
      </div>

      <div className="space-y-3 p-4">
        {CHAT.map((entry) => (
          <div
            key={`${entry.role}-${entry.time}`}
            className={entry.role === "user" ? "ml-auto max-w-[88%]" : "max-w-[90%]"}
          >
            <div
              className={
                entry.role === "user"
                  ? "rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-ui-body text-foreground"
                  : "rounded-lg border border-border/70 bg-[hsl(var(--qe-surface-2))] px-3 py-2 text-ui-body text-foreground"
              }
            >
              {entry.text}
            </div>
            <p className="mt-1 text-right text-ui-micro text-muted-foreground">{entry.time}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border/70 p-3">
        <input
          aria-label="Message AI"
          placeholder="Enter a message..."
          className="h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-ui-body text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </Card>
  )
}
