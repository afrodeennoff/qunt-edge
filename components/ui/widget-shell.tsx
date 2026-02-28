"use client"

import * as React from "react"
import { AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type WidgetShellState = "ready" | "loading" | "empty" | "error"

interface WidgetShellProps {
  title?: React.ReactNode
  description?: React.ReactNode
  info?: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  state?: WidgetShellState
  emptyMessage?: React.ReactNode
  errorMessage?: React.ReactNode
  className?: string
  contentClassName?: string
  children?: React.ReactNode
}

export function WidgetShell({
  title,
  description,
  info,
  icon,
  actions,
  footer,
  state = "ready",
  emptyMessage = "No data available yet.",
  errorMessage = "We couldn't load this widget.",
  className,
  contentClassName,
  children,
}: WidgetShellProps) {
  const renderContent = () => {
    if (state === "loading") {
      return (
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )
    }

    if (state === "error") {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Widget Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )
    }

    if (state === "empty") {
      return (
        <div className="flex h-full min-h-[160px] items-center justify-center p-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )
    }

    return children
  }

  return (
    <Card
      data-widget-shell="v2"
      className={cn("h-full overflow-hidden rounded-xl border-border/60 bg-background/95 shadow-none", className)}
    >
      {(title || actions || icon || description) && (
        <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-4 sm:py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              {(title || icon) && (
                <div className="flex items-center gap-2">
                  {icon ? <span className="text-fg-muted">{icon}</span> : null}
                  {title ? (
                    <CardTitle className="line-clamp-1 text-sm font-semibold text-fg-primary sm:text-[15px]">{title}</CardTitle>
                  ) : null}
                  {info ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-fg-muted transition-colors hover:text-fg-primary"
                            aria-label="Widget info"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{info}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null}
                </div>
              )}
              {description ? (
                <p className="line-clamp-1 text-[11px] text-fg-muted">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("flex-1 min-h-0 p-0", contentClassName)}>
        {renderContent()}
      </CardContent>

      {footer ? (
        <CardFooter className="border-t border-border/50 p-3 sm:p-4">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}
