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
  ({ className, variant = "default", hover = false, size = "md", clickable = false, status, onClick, children, ...props }, ref) => {
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
            "precision-panel text-card-foreground shadow-none": variant === "matte",
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
        {status && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
            <div className={cn(
              "status-dot animate-pulse",
              status === "live" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              status === "synced" && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
              status === "idle" && "bg-slate-500",
              status === "error" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
            )} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 leading-none">{status}</span>
          </div>
        )}

        {variant === "matte" && (
          <div className="absolute inset-0 pointer-events-none border border-white/[0.03] rounded-xl" />
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
  statusDot?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = "md", statusDot, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col space-y-1.5",
        {
          "p-3": size === "sm",
          "p-6": size === "md",
          "p-8": size === "lg",
        },
        className
      )}
      {...props}
    >
      {statusDot ? <div className="absolute right-3 top-3">{statusDot}</div> : null}
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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardStatusDot }
