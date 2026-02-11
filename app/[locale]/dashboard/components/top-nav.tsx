"use client"

import { Bell, Search } from "lucide-react"

interface DashboardTopNavProps {
  title?: string
  showTitle?: boolean
  showNavLinks?: boolean
  showUserProfile?: boolean
}

export function DashboardTopNav({
  title = "Numora",
  showTitle = true,
  showNavLinks = true,
  showUserProfile = true,
}: DashboardTopNavProps) {
  return (
    <header className="surface-panel-md mb-1 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {showTitle ? (
          <p className="text-ui-title font-semibold text-foreground">{title}</p>
        ) : null}

        <div className="relative min-w-[220px] flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search any token"
            placeholder="Search any token"
            className="h-9 w-full rounded-lg border border-border/70 bg-background/70 pl-9 pr-3 text-ui-body text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-border"
          />
        </div>

        {showNavLinks ? (
          <nav className="hidden items-center gap-5 text-ui-body text-muted-foreground lg:flex">
            <button type="button" className="hover:text-foreground">AI Signals</button>
            <button type="button" className="hover:text-foreground">Stake</button>
            <button type="button" className="hover:text-foreground">Portfolio</button>
            <button type="button" className="hover:text-foreground">Smart Alerts</button>
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground hover:text-foreground">
            <Bell className="size-4" />
          </button>
          {showUserProfile ? (
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5">
              <div className="size-6 rounded-full bg-muted" />
              <div>
                <p className="text-ui-micro font-semibold text-foreground">Nollan</p>
                <p className="text-[11px] text-muted-foreground">0x4a7B...Cef1</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
