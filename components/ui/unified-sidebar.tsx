"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { LogOut, MoreHorizontal, Loader2 } from "lucide-react"

import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"
import { useNavigationHelper } from "@/lib/navigation-utils"

export interface UnifiedSidebarItem {
  href?: string
  icon: React.ReactNode
  label: string
  testId?: string
  i18nKey?: string
  action?: () => void
  badge?: React.ReactNode
  group?: string
  disabled?: boolean
  exact?: boolean
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
  styleVariant?: "default" | "minimal" // Simplified to shadcn default
}

function stripLocalePrefix(pathname: string) {
  if (!pathname) return "/"
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/, "")
  return withoutLocale.length > 0 ? (withoutLocale.startsWith("/") ? withoutLocale : `/${withoutLocale}`) : "/"
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

  return (href: string, exact = false) => {
    if (!pathname || !href) return false

    const normalizedPathname = stripLocalePrefix(pathname).replace(/\/$/, "") || "/"
    const [hrefPath, queryString] = href.split("?")
    const normalizedHrefPath = stripLocalePrefix(hrefPath).replace(/\/$/, "") || "/"

    const hrefParams = new URLSearchParams(queryString ?? "")
    const hrefTab = hrefParams.get("tab")

    // Handle tab-based navigation (e.g., /dashboard?tab=widgets)
    if (hrefTab) {
      const activeTab = searchParams.get("tab") || "widgets"
      if (normalizedPathname === normalizedHrefPath && activeTab === hrefTab) {
        return true
      }
    }

    // Default tab handling for /dashboard
    if (normalizedHrefPath === "/dashboard" && !hrefTab) {
      const activeTab = searchParams.get("tab")
      if (normalizedPathname === "/dashboard" && (!activeTab || activeTab === "widgets")) {
        return true
      }
    }

    // Exact match
    if (exact) {
      return normalizedPathname === normalizedHrefPath
    }

    // Nested routes
    if (normalizedPathname === normalizedHrefPath) return true
    if (normalizedPathname.startsWith(`${normalizedHrefPath}/`)) return true

    return false
  }
}

export function UnifiedSidebar({
  items,
  user,
  actions,
  timezone,
  onLogout,
}: UnifiedSidebarConfig) {
  const t = useI18n()
  const translate = t as unknown as (key: string) => string
  const isActive = useActiveLink()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const { isLoading } = useNavigationLoading()
  const { isQueryParamOnly } = useNavigationHelper()
  const isCollapsed = state === "collapsed"
  const debugCache = process.env.NEXT_PUBLIC_CACHE_DEBUG === "true"
  const pathname = usePathname()

  const groupedItems = useMemo(() => {
    const order: string[] = []
    const groups: Record<string, UnifiedSidebarItem[]> = {}

    items.forEach((item) => {
      const group = item.group || "Settings"
      if (!groups[group]) {
        groups[group] = []
        order.push(group)
      }
      groups[group].push(item)
    })

    // Move specific groups to top/bottom for consistent feel across different layouts
    const sortedOrder = order.sort((a, b) => {
      const topGroups = ["Overview", "Main", "Inventory", "Trading", "Team Overview", "Team Management", "Admin Panel"]
      const bottomGroups = ["System", "Settings", "Support", "Admin"]

      const aIdxTop = topGroups.indexOf(a)
      const bIdxTop = topGroups.indexOf(b)
      if (aIdxTop !== -1 && bIdxTop !== -1) return aIdxTop - bIdxTop
      if (aIdxTop !== -1) return -1
      if (bIdxTop !== -1) return 1

      const aIdxBot = bottomGroups.indexOf(a)
      const bIdxBot = bottomGroups.indexOf(b)
      if (aIdxBot !== -1 && bIdxBot !== -1) return aIdxBot - bIdxBot
      if (aIdxBot !== -1) return 1
      if (bIdxBot !== -1) return -1

      return a.localeCompare(b)
    })

    return { groups, order: sortedOrder }
  }, [items])

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = useMemo(() => getUserInitials(user), [user])

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground pointer-events-auto">
      <SidebarHeader className="border-b border-sidebar-border/30 h-14 flex flex-col justify-center px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton size="lg" className="pointer-events-auto transition-colors group flex-1">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Logo className="size-5 fill-current" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none px-1 overflow-hidden">
                  <span className="truncate font-bold tracking-tight text-sm uppercase">Qunt Edge</span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium">Workspace</span>
                </div>
              </SidebarMenuButton>
              <SidebarTrigger
                className="opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex h-6 w-6"
                aria-label="Toggle sidebar"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
        {groupedItems.order.map((groupName, groupIndex) => (
          <SidebarGroup key={groupName} className="px-2 py-2">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50 mb-1" id={`sidebar-group-${groupIndex}`}>
              {groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu role="menu" aria-labelledby={`sidebar-group-${groupIndex}`}>
                {groupedItems.groups[groupName].map((item, index) => {
                  const label = item.i18nKey ? translate(item.i18nKey) : item.label
                  const href = item.href
                  const isItemDisabled = Boolean(item.disabled)
                  const itemIsActive = !isItemDisabled && !!href && isActive(href, item.exact)

                  return (
                    <SidebarMenuItem key={`${groupName}-${item.label}-${index}`}>
                      <SidebarMenuButton
                        asChild={!!href}
                        isActive={itemIsActive}
                        tooltip={label}
                        disabled={isItemDisabled}
                        onClick={!href ? () => {
                          item.action?.()
                          if (isMobile) setOpenMobile(false)
                        } : undefined}
                        className={cn("pointer-events-auto font-medium transition-colors", itemIsActive && "font-semibold shadow-sm")}
                      >
                        {href ? (
                          <Link
                            href={href}
                            data-testid={item.testId}
                            prefetch={false}
                            onClick={() => {
                              if (debugCache) {
                                console.info("[CacheDebug] sidebar navigation click", {
                                  from: pathname,
                                  to: href,
                                  isQueryParamOnly: isQueryParamOnly(href),
                                  hasServiceWorkerController: typeof navigator !== "undefined"
                                    ? Boolean(navigator.serviceWorker?.controller)
                                    : false,
                                })
                              }
                              if (isMobile && !isQueryParamOnly(href)) {
                                setOpenMobile(false)
                              }
                            }}
                            className="flex items-center w-full"
                          >
                            {isLoading && itemIsActive ? (
                              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-sidebar-primary" />
                            ) : (
                              <span className="shrink-0">{item.icon}</span>
                            )}
                            <span className="ml-3 truncate">{label}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center w-full" data-testid={item.testId}>
                            <span className="shrink-0">{item.icon}</span>
                            <span className="ml-3 truncate">{label}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {actions && (
          <SidebarGroup className="mt-auto pt-4 pb-2 border-t border-sidebar-border/30 px-2">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/30 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                >
                  <Avatar className="h-8 w-8 rounded-lg overflow-hidden border border-sidebar-border shadow-sm">
                    <AvatarImage src={user?.avatar_url} alt={displayName} />
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-1.5">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">{user?.email || "Free Plan"}</span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4 text-sidebar-foreground/50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl overflow-hidden shadow-lg border-sidebar-border"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={6}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 text-left text-sm bg-sidebar-accent/50 dark:bg-sidebar-accent/10">
                    <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border shadow-sm">
                      <AvatarImage src={user?.avatar_url} alt={displayName} />
                      <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs opacity-80">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {timezone && (
                  <div className="px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-1 mb-1.5">Timezone</p>
                    <div className="relative">
                      <select
                        value={timezone.value}
                        onChange={(e) => timezone.onChange(e.target.value)}
                        className="w-full bg-transparent text-sm p-1.5 focus:outline-none cursor-pointer border rounded-md border-sidebar-border/50 hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-colors appearance-none"
                      >
                        {timezone.options.map((tz) => (
                          <option key={tz} value={tz} className="bg-popover text-popover-foreground">
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer my-1 mx-1"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
