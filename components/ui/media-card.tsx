"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardProps } from "./card"
import { Badge } from "./badge"

export interface MediaCardProps extends Omit<CardProps, 'size'> {
  image: string
  title: string
  subtitle?: string
  description?: string
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "outline" | "destructive" }>
  actions?: React.ReactNode
  imageAspect?: "video" | "square" | "portrait"
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(
  ({ 
    image,
    title,
    subtitle,
    description,
    badges,
    actions,
    imageAspect = "video",
    onClick,
    size = "md",
    className,
    ...props 
  }, ref) => {
    const aspectClasses = {
      video: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]"
    }

    const sizeClasses = {
      sm: {
        title: "text-sm",
        description: "text-xs",
        padding: "p-4"
      },
      md: {
        title: "text-base",
        description: "text-sm",
        padding: "p-6"
      },
      lg: {
        title: "text-lg",
        description: "text-base",
        padding: "p-8"
      }
    }

    const currentSize = sizeClasses[size]

    return (
    <Card
      ref={ref}
      hover={!!onClick}
      clickable={!!onClick}
      className={cn("overflow-hidden group", currentSize.padding, className)}
      onClick={onClick}
      aria-label={title}
      {...props}
    >
      <div className={cn("relative overflow-hidden bg-muted", aspectClasses[imageAspect])} aria-hidden="true">
        <img
          src={image}
          alt=""
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-1">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || "default"} className="text-xs">
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

        <CardHeader className={currentSize.padding}>
          <div className="space-y-1">
            <CardTitle className={cn(currentSize.title, "line-clamp-2")}>
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </CardHeader>

        {description && (
          <CardContent className={cn("pt-0", currentSize.padding)}>
            <p className={cn(currentSize.description, "text-muted-foreground line-clamp-3")}>
              {description}
            </p>
          </CardContent>
        )}

        {actions && (
          <CardFooter className={cn("pt-0", currentSize.padding)}>
            <div className="flex items-center gap-2 w-full">
              {actions}
            </div>
          </CardFooter>
        )}
      </Card>
    )
  }
)
MediaCard.displayName = "MediaCard"

export { MediaCard }
