import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type UnifiedPageShellProps = {
  children: ReactNode
  className?: string
  widthClassName?: string
}

type UnifiedPageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

type UnifiedSurfaceProps = {
  children: ReactNode
  className?: string
}

export function UnifiedPageShell({
  children,
  className,
  widthClassName = "max-w-7xl",
}: UnifiedPageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-10 sm:px-6 lg:px-8",
        "animate-in fade-in-0 duration-500",
        widthClassName,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function UnifiedPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: UnifiedPageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 rounded-3xl border border-white/12 bg-black/45 px-5 py-6 shadow-sm backdrop-blur-sm sm:px-6",
        "transition-colors duration-200 hover:border-white/20",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">{eyebrow}</p> : null}
          <h1 className="text-3xl font-semibold tracking-tight text-fg-primary sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-fg-muted sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

export function UnifiedSurface({ children, className }: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/12 bg-black/45 p-4 shadow-sm backdrop-blur-sm sm:p-6",
        "transition-colors duration-200 hover:border-white/20",
        className,
      )}
    >
      {children}
    </section>
  )
}
