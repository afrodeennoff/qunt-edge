"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronsLeft, ChevronsRight, Globe, LogOut } from "lucide-react"

import { Logo } from "@/components/logo"
import { SubscriptionBadge } from "@/components/subscription-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"

export interface UnifiedSidebarItem {
  href?: string
  icon: React.ReactNode
  label: string
  i18nKey?: string
  action?: () => void
  badge?: React.ReactNode
  group?: string
  disabled?: boolean
}

export interface UnifiedSidebarConfig {
  items: UnifiedSidebarItem[]
  user?: {
    avatar_url?: string
    email?: string
    full_name?: string
  }
  actions?: React.ReactNode
  showSubscription?: boolean
  timezone?: {
    value: string
    options: string[]
    onChange: (value: string) => void
  }
  onLogout?: () => void
  styleVariant?: UnifiedSidebarStyle
}

export type UnifiedSidebarStyle = "minimal" | "glassy" | "matte"

function stripLocalePrefix(pathname: string) {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "")
  return withoutLocale.length > 0 ? withoutLocale : "/"
}

function getUserInitials(user?: UnifiedSidebarConfig["user"]) {
  const raw = user?.full_name || user?.email || "User"
  const parts = raw
    .replace(/@.*/, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) return "U"
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

function useActiveLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (href: string) => {
    if (!pathname) return false

    const normalizedPathname = stripLocalePrefix(pathname)
    const [basePath, queryString] = href.split("?")
    const hrefParams = new URLSearchParams(queryString ?? "")
    const hrefTab = hrefParams.get("tab")

    if (basePath === "/dashboard" && hrefTab) {
      const activeTab = searchParams.get("tab") || "widgets"
      return normalizedPathname === "/dashboard" && activeTab === hrefTab
    }

    if (basePath === "/dashboard") {
      return (
        normalizedPathname === "/dashboard" &&
        (searchParams.get("tab") || "widgets") === "widgets"
      )
    }

    if (basePath === "/teams/manage" && normalizedPathname.includes("/teams/manage")) {
      return true
    }

    if (basePath === "/teams/dashboard" && normalizedPathname.includes("/teams/dashboard")) {
      return true
    }

    return (
      normalizedPathname === basePath ||
      normalizedPathname.startsWith(`${basePath}/`)
    )
  }
}

const SIDEBAR_STYLES: Record<
  UnifiedSidebarStyle,
  {
    sidebar: string
    header: string
    footer: string
    brandName: string
    brandSub: string
    userCard: string
    userName: string
    userMeta: string
    groupLabel: string
    collapseButton: string
  }
> = {
  minimal: {
    sidebar: "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
    header: "border-b border-sidebar-border/70",
    footer: "border-t border-sidebar-border/70",
    brandName: "text-sidebar-foreground",
    brandSub: "text-sidebar-foreground/60",
    userCard: "rounded-md border border-sidebar-border/70 bg-sidebar-accent/40 p-2.5",
    userName: "text-sidebar-foreground",
    userMeta: "text-sidebar-foreground/60",
    groupLabel: "text-sidebar-foreground/60",
    collapseButton:
      "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
  },
  glassy: {
    sidebar: "border-r border-white/10 bg-black/95 text-zinc-100 backdrop-blur-xl",
    header: "border-b border-white/10",
    footer: "border-t border-white/10",
    brandName: "text-white",
    brandSub: "text-zinc-400",
    userCard: "rounded-md border border-white/10 bg-white/5 p-2.5",
    userName: "text-zinc-100",
    userMeta: "text-zinc-400",
    groupLabel: "text-zinc-500",
    collapseButton: "text-zinc-400 hover:text-zinc-100 hover:bg-white/10",
  },
  matte: {
    sidebar: "border-r border-white/5 bg-black text-zinc-200",
    header: "border-b border-white/5",
    footer: "border-t border-white/5",
    brandName: "text-zinc-100",
    brandSub: "text-zinc-500",
    userCard: "rounded-md border border-white/10 bg-zinc-950 p-2.5",
    userName: "text-zinc-100",
    userMeta: "text-zinc-400",
    groupLabel: "text-zinc-500",
    collapseButton: "text-zinc-400 hover:text-zinc-100 hover:bg-white/10",
  },
}

export function UnifiedSidebar({
  items,
  user,
  actions,
  showSubscription = true,
  timezone,
  onLogout,
  styleVariant = "minimal",
}: UnifiedSidebarConfig) {
  const t = useI18n()
  const translate = t as unknown as (key: string) => string
  const isActive = useActiveLink()
  const { state, toggleSidebar } = useSidebar()
  const styles = SIDEBAR_STYLES[styleVariant]

  const groupedItems = useMemo(() => {
    const order: string[] = []
    const groups: Record<string, UnifiedSidebarItem[]> = {}

    items.forEach((item) => {
      const group = item.group || "Main"
      if (!groups[group]) {
        groups[group] = []
        order.push(group)
      }
      groups[group].push(item)
    })

    return { groups, order }
  }, [items])

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = useMemo(() => getUserInitials(user), [user])

  return (
    <Sidebar collapsible="icon" className={styles.sidebar}>
      <SidebarHeader className={cn("h-14 flex items-center px-4", styles.header)}>
        <div className="flex items-center gap-2 w-full">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-current/15 bg-current/5">
            <Logo className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className={cn("truncate text-sm font-semibold tracking-tight", styles.brandName)}>
              Qunt Edge
            </p>
            <p className={cn("truncate text-[10px] uppercase tracking-widest opacity-60", styles.brandSub)}>Workspace</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "ml-auto h-7 w-7 transition-all duration-300",
              state === "collapsed" && "ml-0 mx-auto",
              styles.collapseButton
            )}
          >
            {state === "expanded" ? (
              <ChevronsLeft className="size-4" />
            ) : (
              <ChevronsRight className="size-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-3">
            {groupedItems.order.map((groupName) => (
              <SidebarGroup key={groupName} className="p-0">
                {groupName !== "Main" && (
                  <SidebarGroupLabel className={styles.groupLabel}>
                    {groupName}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupedItems.groups[groupName].map((item, index) => {
                      const label = item.i18nKey ? translate(item.i18nKey) : item.label
                      const isItemDisabled = Boolean(item.disabled)
                      const itemIsActive =
                        !isItemDisabled && !!item.href && isActive(item.href)

                      return (
                        <SidebarMenuItem key={`${groupName}-${item.label}-${index}`}>
                          {item.href && !isItemDisabled ? (
                            <SidebarMenuButton
                              asChild
                              isActive={itemIsActive}
                              tooltip={label}
                            >
                              <Link href={item.href} aria-current={itemIsActive ? "page" : undefined}>
                                {item.icon}
                                <span>{label}</span>
                              </Link>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton
                              type="button"
                              tooltip={label}
                              disabled={isItemDisabled}
                              onClick={item.action}
                            >
                              {item.icon}
                              <span>{label}</span>
                            </SidebarMenuButton>
                          )}
                          {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>

          <div className="mt-auto space-y-2 pt-2">
            {actions ? (
              <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
                <SidebarGroupContent>
                  <SidebarMenu>{actions}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : null}

            {timezone ? (
              <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
                <SidebarGroupContent>
                  <div className="px-2">
                    <Select value={timezone.value} onValueChange={timezone.onChange}>
                      <SelectTrigger className="h-8">
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="size-3.5 text-muted-foreground" />
                          <SelectValue placeholder="Select timezone" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {timezone.options.map((tz) => (
                          <SelectItem key={tz} value={tz} className="text-xs">
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : null}
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className={cn("p-2", styles.footer)}>
        <div className="space-y-2">
          {user ? (
            <div className={cn(styles.userCard, "group-data-[collapsible=icon]:p-1.5")}>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8 rounded-md">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className={cn("truncate text-sm font-medium", styles.userName)}>
                    {displayName}
                  </p>
                  <p className={cn("truncate text-[11px]", styles.userMeta)}>
                    {user.email || "Signed in"}
                  </p>
                </div>
                {showSubscription ? (
                  <div className="group-data-[collapsible=icon]:hidden">
                    <SubscriptionBadge className="scale-90 shadow-none" />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {onLogout ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start group-data-[collapsible=icon]:justify-center"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          ) : null}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
