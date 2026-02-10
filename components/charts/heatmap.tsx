"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface HeatmapData {
  x: string
  y: string
  value: number
}

interface HeatmapProps {
  data: HeatmapData[]
  title?: string
  height?: number
}

// Function to map value to color intensity
const getColor = (value: number) => {
  if (value === 0) return "bg-muted/20"
  if (value > 0) {
    // Green scale
    if (value < 20) return "bg-green-900/40"
    if (value < 50) return "bg-green-700/60"
    if (value < 80) return "bg-green-600/80"
    return "bg-green-500"
  } else {
    // Red scale
    if (value > -20) return "bg-red-900/40"
    if (value > -50) return "bg-red-700/60"
    if (value > -80) return "bg-red-600/80"
    return "bg-red-500"
  }
}

export function Heatmap({ data, title, height = 300 }: HeatmapProps) {
  // We need to organize data into a grid.
  // Assume data is sparse or full.
  // Let's create a simple grid visualization.

  // Extract unique X and Y labels
  const xLabels = Array.from(new Set(data.map(d => d.x)))
  const yLabels = Array.from(new Set(data.map(d => d.y)))

  return (
    <Card className="flex flex-col border-none bg-transparent shadow-none" style={{ height }}>
      {title && (
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 p-4 min-h-0 overflow-auto">
        <div className="grid gap-1" style={{
            gridTemplateColumns: `auto repeat(${xLabels.length}, 1fr)`
        }}>
          {/* Header Row */}
          <div className="h-8"></div> {/* Corner */}
          {xLabels.map(label => (
            <div key={label} className="flex items-center justify-center text-xs text-muted-foreground h-8">
              {label}
            </div>
          ))}

          {/* Data Rows */}
          {yLabels.map(yLabel => (
            <React.Fragment key={yLabel}>
              <div className="flex items-center justify-end pr-2 text-xs text-muted-foreground font-medium">
                {yLabel}
              </div>
              {xLabels.map(xLabel => {
                const item = data.find(d => d.x === xLabel && d.y === yLabel)
                const value = item ? item.value : 0
                return (
                  <div
                    key={`${xLabel}-${yLabel}`}
                    className={cn(
                        "h-8 rounded-sm transition-colors hover:ring-1 hover:ring-primary/50",
                        getColor(value)
                    )}
                    title={`${xLabel} / ${yLabel}: ${value}`}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
