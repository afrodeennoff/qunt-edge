"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SegmentedOption = { label: string; value: string }

export interface SegmentedControlProps {
  options: string[] | SegmentedOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  size?: "sm" | "md"
}

function normalizeOptions(options: string[] | SegmentedOption[]): SegmentedOption[] {
  if (options.length === 0) return []
  if (typeof options[0] === "string") {
    return (options as string[]).map((value) => ({ label: value, value }))
  }
  return options as SegmentedOption[]
}

export function SegmentedControl({ options, value, onChange, className, size = "sm" }: SegmentedControlProps) {
  const normalized = React.useMemo(() => normalizeOptions(options), [options])

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border/80 bg-background/60 p-1",
        size === "sm" ? "h-8" : "h-9",
        className,
      )}
      role="tablist"
      aria-label="Segmented control"
    >
      {normalized.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              size === "sm" ? "py-1 text-xs" : "py-1.5 text-sm",
              isActive
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
