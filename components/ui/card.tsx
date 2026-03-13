import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "flat" | "matte"
  hover?: boolean
  size?: "sm" | "md" | "lg"
  clickable?: boolean
  status?: CardStatusTone
}

export type CardStatusTone = "live" | "synced" | "idle" | "error"

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      size = "md",
      clickable = false,
      status,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = clickable || typeof onClick === "function"

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    return (
      <div
        ref={ref}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={cn(
          "relative rounded-xl border bg-card text-card-foreground shadow-sm",
          {
            "border-border bg-card": variant === "default",
            "border-border/70 bg-secondary/22 backdrop-blur-md": variant === "glass",
            "border-border bg-card shadow-md": variant === "elevated",
            "border-2 border-border bg-transparent shadow-none": variant === "outlined",
            "border-0 bg-transparent shadow-none": variant === "flat",
            "precision-panel border-border/60 bg-card text-card-foreground shadow-none":
              variant === "matte",
          },
          {
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md": hover,
            "cursor-pointer": isInteractive,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2":
              isInteractive,
          },
          {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-lg": size === "lg",
          },
          className
        )}
        onClick={isInteractive ? onClick : undefined}
        {...props}
      >
        {status && (
          <div className="absolute right-[var(--space-3)] top-[var(--space-3)] z-20 flex items-center gap-[var(--space-2)] rounded-full border border-border/70 bg-background/80 px-[var(--space-2)] py-[var(--space-1)] backdrop-blur-sm">
            <div className={cn(
              "status-dot",
              status === "live" && "status-dot-live",
              status === "synced" && "status-dot-synced",
              status === "idle" && "status-dot-idle",
              status === "error" && "status-dot-error"
            )} />
            <span className="text-[10px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
              {status}
            </span>
          </div>
        )}

        {variant === "matte" && (
          <div className="absolute inset-0 pointer-events-none border border-border/40 rounded-xl" />
        )}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  statusDot?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = "md", statusDot, children, ...props }, ref) => (
    <div
      ref={ref}
        className={cn(
          "relative flex flex-col space-y-[var(--space-2)]",
          {
            "p-[var(--space-4)]": size === "sm",
            "p-[var(--space-6)]": size === "md",
            "p-[var(--space-8)]": size === "lg",
          },
          className
        )}
      {...props}
    >
      {statusDot ? <div className="absolute right-[var(--space-3)] top-[var(--space-3)]">{statusDot}</div> : null}
      {children}
    </div>
  )
)
CardHeader.displayName = "CardHeader"

export interface CardStatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: CardStatusTone
  label?: string
}

const CardStatusDot = React.forwardRef<HTMLSpanElement, CardStatusDotProps>(
  ({ className, tone = "idle", label, ...props }, ref) => (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      <span
        ref={ref}
        className={cn("status-dot", {
          "status-dot-live": tone === "live",
          "status-dot-synced": tone === "synced",
          "status-dot-idle": tone === "idle",
          "status-dot-error": tone === "error",
        }, className)}
        aria-hidden
        {...props}
      />
      {label ? <span className="micro-sans">{label}</span> : null}
    </span>
  )
)
CardStatusDot.displayName = "CardStatusDot"

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
          "p-[var(--space-4)] pt-0": size === "sm",
          "p-[var(--space-6)] pt-0": size === "md",
          "p-[var(--space-8)] pt-0": size === "lg",
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
          "p-[var(--space-4)] pt-0": size === "sm",
          "p-[var(--space-6)] pt-0": size === "md",
          "p-[var(--space-8)] pt-0": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardStatusDot }
