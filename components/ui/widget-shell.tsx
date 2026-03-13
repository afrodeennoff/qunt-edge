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
export type WidgetShellVariant = "default" | "hoverable"

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
  variant?: WidgetShellVariant
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
  variant = "default",
  className,
  contentClassName,
  children,
}: WidgetShellProps) {
  const renderContent = () => {
    if (state === "loading") {
      return (
        <div className="space-y-[var(--space-3)] p-[var(--space-4)]">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )
    }

    if (state === "error") {
      return (
        <div className="p-[var(--space-4)]">
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
        <div className="flex h-full min-h-[160px] items-center justify-center p-[var(--space-4)] text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )
    }

    return children
  }

  return (
    <Card
      data-widget-shell="v2"
      className={cn(
        "h-full overflow-hidden rounded-[var(--radius)] border-border bg-card shadow-none transition-all duration-200",
        variant === "hoverable" && "hover:shadow-md hover:border-border",
        className
      )}
    >
      {(title || actions || icon || description) && (
        <CardHeader className="border-b border-border px-[var(--space-4)] py-[var(--space-3)] sm:px-[var(--space-4)] sm:py-[var(--space-3)]">
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="min-w-0 space-y-[var(--space-2)]">
              {(title || icon) && (
                <div className="flex items-center gap-[var(--space-2)]">
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
        <CardFooter className="border-t border-border p-[var(--space-4)] sm:p-[var(--space-4)]">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}
