"use client"

import { Responsive, WidthProvider } from "react-grid-layout"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import React, { useEffect, useState } from "react"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

interface WidgetGridProps {
  children: React.ReactNode
  className?: string
  layouts?: ReactGridLayout.Layouts
  onLayoutChange?: (layout: ReactGridLayout.Layout[], layouts: ReactGridLayout.Layouts) => void
  isDraggable?: boolean
  isResizable?: boolean
  rowHeight?: number
  breakpoints?: { lg: number; md: number; sm: number; xs: number; xxs: number }
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number }
}

export function WidgetGrid({
  children,
  className,
  layouts = { lg: [] },
  onLayoutChange,
  isDraggable = true,
  isResizable = true,
  rowHeight = 100,
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
}: WidgetGridProps) {
  const [mounted, setMounted] = useState(false)

  // Wait for mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={cn("w-full min-h-screen bg-canvas p-4", className)}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        onLayoutChange={onLayoutChange}
        isDraggable={isDraggable}
        isResizable={isResizable}
        margin={[16, 16]} // standard spacing
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  )
}
