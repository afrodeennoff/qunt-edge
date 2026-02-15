"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type ChartSurfaceState = "ready" | "loading" | "empty" | "error"

interface ChartSurfaceProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  info?: React.ReactNode
  state?: ChartSurfaceState
  emptyMessage?: React.ReactNode
  errorMessage?: React.ReactNode
  size?: "tiny" | "small" | "small-long" | "medium" | "large" | "extra-large"
  className?: string
  headerClassName?: string
  bodyClassName?: string
  children?: React.ReactNode
}

export function ChartSurface({
  title,
  subtitle,
  actions,
  info,
  state = "ready",
  emptyMessage = "No trades yet.",
  errorMessage = "Unable to load chart.",
  size = "medium",
  className,
  headerClassName,
  bodyClassName,
  children,
}: ChartSurfaceProps) {
  const isSmall = size === "small" || size === "tiny"
  const hasHeader = Boolean(title || subtitle || actions || info)
  const shouldPadBody = hasHeader || state !== "ready"

  const renderBody = () => {
    if (state === "loading") {
      return (
        <div className="space-y-3 p-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      )
    }

    if (state === "error") {
      return (
        <div className="flex h-full min-h-[160px] items-center justify-center p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )
    }

    if (state === "empty") {
      return (
        <div className="flex h-full min-h-[160px] items-center justify-center p-3 text-xs text-white/55">
          {emptyMessage}
        </div>
      )
    }

    return children
  }

  return (
    <div
      data-chart-surface="modern"
      className={cn(
        "h-full flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-border/55 bg-[hsl(var(--surface-1))] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex flex-col items-stretch space-y-0 border-b border-border/50 shrink-0",
            isSmall ? "p-2 h-10 justify-center" : "p-3 h-12 justify-center",
            headerClassName
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              {title ? (
                <span
                  className={cn(
                    "line-clamp-1 font-bold tracking-tight text-fg-primary",
                    isSmall ? "text-sm" : "text-base"
                  )}
                >
                  {title}
                </span>
              ) : null}
              {info}
              {subtitle ? (
                <span className="hidden text-xs text-fg-muted sm:inline">{subtitle}</span>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex-1 min-h-0",
          shouldPadBody ? (isSmall ? "p-1" : "p-2 sm:p-3") : "p-0",
          bodyClassName
        )}
      >
        {renderBody()}
      </div>
    </div>
  )
}
