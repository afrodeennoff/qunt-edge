import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "flat"
  hover?: boolean
  size?: "sm" | "md" | "lg"
  clickable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, size = "md", clickable = false, onClick, children, ...props }, ref) => {
    const isInteractive = clickable || typeof onClick === "function"

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick?.(e as any)
      }
    }

    return (
      <article
        ref={ref}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={cn(
          "relative overflow-hidden rounded-xl group transition-all duration-300",
          {
            "bg-card border border-border": variant === "default" || variant === "glass",
            "bg-card text-card-foreground border border-border shadow-sm": variant === "elevated",
            "border-2 border-border bg-transparent shadow-none": variant === "outlined",
            "border-0 bg-transparent shadow-none": variant === "flat",
          },
          {
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-teal-500/5": hover,
            "cursor-pointer active:scale-[0.98]": clickable,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2": clickable,
          },
          {
            "p-3": size === "sm",
            "p-6": size === "md",
            "p-8": size === "lg",
          },
          className
        )}
        onClick={isInteractive ? onClick : undefined}
        {...props}
      >
        {hover && (
          <>
            <div className="absolute top-0 left-0 h-[1px] w-full bg-border/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        )}

        <div className={cn(
          "relative z-10",
          className?.includes("flex-col") && "flex flex-col h-full",
          className?.includes("h-full") && "h-full"
        )}>
          {children}
        </div>
      </article>
    )
  }
)
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        {
          "p-3": size === "sm",
          "p-6": size === "md",
          "p-8": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = "lg", ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
          "text-xl": size === "xl",
        },
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        {
          "pt-0": size === "md",
        },
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        {
          "pt-0": size === "md",
        },
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
