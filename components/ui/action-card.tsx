"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription, CardProps } from "./card"
import { Button } from "./button"
import { LucideIcon } from "lucide-react"

export interface ActionCardProps extends CardProps {
  title: string
  description?: string
  icon?: LucideIcon
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  size?: "sm" | "md" | "lg"
  status?: "default" | "success" | "warning" | "error"
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ 
    title,
    description,
    icon: Icon,
    primaryAction,
    secondaryAction,
    size = "md",
    status = "default",
    className,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: {
        icon: "h-8 w-8",
        iconInner: "h-4 w-4",
        title: "text-base",
        description: "text-xs",
        padding: "p-4",
        button: "text-xs h-8 px-3"
      },
      md: {
        icon: "h-12 w-12",
        iconInner: "h-6 w-6",
        title: "text-lg",
        description: "text-sm",
        padding: "p-6",
        button: "text-sm h-9 px-4"
      },
      lg: {
        icon: "h-16 w-16",
        iconInner: "h-8 w-8",
        title: "text-xl",
        description: "text-base",
        padding: "p-8",
        button: "text-base h-10 px-6"
      }
    }

    const currentSize = sizeClasses[size]

    const statusColors = {
      default: "bg-primary/10 text-primary",
      success: "bg-green-500/10 text-green-500",
      warning: "bg-amber-500/10 text-amber-500",
      error: "bg-red-500/10 text-red-500"
    }

    return (
      <Card
        ref={ref}
        className={cn(currentSize.padding, className)}
        {...props}
      >
        <CardHeader className={cn(currentSize.padding, "space-y-3")}>
          <div className="flex items-start gap-4">
            {Icon && (
              <div className={cn(
                "rounded-xl flex items-center justify-center shrink-0",
                currentSize.icon,
                statusColors[status]
              )}>
                <Icon className={currentSize.iconInner} />
              </div>
            )}
            <div className="flex-1 space-y-1 min-w-0">
              <CardTitle className={cn(currentSize.title, "line-clamp-2")}>
                {title}
              </CardTitle>
              {description && (
                <CardDescription className={cn(currentSize.description, "line-clamp-3")}>
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {(primaryAction || secondaryAction) && (
          <CardFooter className={cn("pt-0 gap-2", currentSize.padding)}>
            {secondaryAction && (
              <Button
                variant="outline"
                className={cn("flex-1", currentSize.button)}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant || "default"}
                className={cn("flex-1", currentSize.button)}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    )
  }
)
ActionCard.displayName = "ActionCard"

export { ActionCard }
