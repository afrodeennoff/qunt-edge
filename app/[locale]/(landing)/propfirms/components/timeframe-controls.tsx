"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Timeframe } from "../actions/timeframe-utils"

interface TimeframeControlsProps {
  timeframeLabel: string
  timeframeOptions: {
    currentMonth: string
    last3Months: string
    last6Months: string
    '2024': string
    '2025': string
    '2026': string
    allTime: string
  }
}

export function TimeframeControls({ timeframeLabel, timeframeOptions }: TimeframeControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTimeframe = (searchParams.get("timeframe") || "2026") as Timeframe

  const handleTimeframeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "2026") {
      params.delete("timeframe")
    } else {
      params.set("timeframe", value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="timeframe-select" className="text-xs font-semibold tracking-wide text-fg-muted">
        {timeframeLabel}
      </Label>
      <Select value={currentTimeframe} onValueChange={handleTimeframeChange}>
        <SelectTrigger
          id="timeframe-select"
          className="w-[200px] border border-border/40 bg-card/60 text-foreground shadow-none backdrop-blur-sm hover:bg-card/70 focus-visible:ring-1 focus-visible:ring-border/60 focus-visible:ring-offset-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border border-border/40 bg-card/90 text-foreground">
          <SelectItem value="currentMonth">{timeframeOptions.currentMonth}</SelectItem>
          <SelectItem value="last3Months">{timeframeOptions.last3Months}</SelectItem>
          <SelectItem value="last6Months">{timeframeOptions.last6Months}</SelectItem>
          <SelectItem value="2024">{timeframeOptions['2024']}</SelectItem>
          <SelectItem value="2025">{timeframeOptions['2025']}</SelectItem>
          <SelectItem value="2026">{timeframeOptions['2026']}</SelectItem>
          <SelectItem value="allTime">{timeframeOptions.allTime}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
