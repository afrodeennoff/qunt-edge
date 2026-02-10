"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardProps } from "./card"
import { LucideIcon } from "lucide-react"

export interface StatsCardProps extends CardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    description, 
    size = "md",
    onClick,
    className,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: {
        icon: "h-4 w-4",
        value: "text-lg",
        title: "text-xs",
        trend: "text-xs",
        padding: "p-4"
      },
      md: {
        icon: "h-5 w-5",
        value: "text-2xl",
        title: "text-sm",
        trend: "text-sm",
        padding: "p-6"
      },
      lg: {
        icon: "h-6 w-6",
        value: "text-3xl",
        title: "text-base",
        trend: "text-base",
        padding: "p-8"
      }
    }

    const currentSize = sizeClasses[size]

    return (
      <Card
        ref={ref}
        hover={!!onClick}
        clickable={!!onClick}
        className={cn("group", currentSize.padding, className)}
        onClick={onClick}
        aria-label={title}
        {...props}
      >
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {Icon && (
                <div className="shrink-0" aria-hidden="true">
                  <Icon className={cn(currentSize.icon, "text-muted-foreground group-hover:text-primary transition-colors")} />
                </div>
              )}
              <h3 className={cn(currentSize.title, "font-medium text-muted-foreground truncate")}>
                {title}
              </h3>
            </div>
            {trend && (
              <div 
                className={cn(
                  "flex items-center gap-1 shrink-0",
                  trend.isPositive ? "text-green-500" : "text-red-500",
                  currentSize.trend
                )}
                aria-label={`${trend.isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(trend.value)}%`}
              >
                <span className="font-medium">
                  {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          
          <div 
            className={cn(
              "font-bold tracking-tight",
              currentSize.value,
              trend?.isPositive ? "text-green-500" : trend?.isPositive === false ? "text-red-500" : "text-foreground"
            )}
            aria-label={`Value: ${value}`}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {description && (
            <p className={cn("text-muted-foreground", currentSize.trend)}>
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }
)
StatsCard.displayName = "StatsCard"

export { StatsCard }
