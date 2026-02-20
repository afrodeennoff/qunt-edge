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

  return (href: string, exact = false, tabParam?: string) => {
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
  const { isMobile, setOpenMobile } = useSidebar()
  const { isLoading } = useNavigationLoading()
  const { isQueryParamOnly } = useNavigationHelper()

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
  }, [items.length, JSON.stringify(items.map(i => ({ href: i.href, label: i.label, group: i.group })))])

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = useMemo(() => getUserInitials(user), [user])

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar text-sidebar-foreground pointer-events-auto">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border/50 relative z-20 pointer-events-auto">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Logo className="size-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground uppercase">
              Qunt Edge
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Workspace
            </p>
          </div>
          <SidebarTrigger className="hidden md:flex ml-auto h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin relative z-10 pointer-events-auto">
        {groupedItems.order.map((groupName, groupIndex) => (
          <SidebarGroup key={groupName} className="px-2 py-2 relative z-10 pointer-events-auto">
            <SidebarGroupLabel 
              className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 mb-2 pointer-events-auto"
              id={`sidebar-group-${groupIndex}`}
            >
              {groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu role="menu" aria-labelledby={`sidebar-group-${groupIndex}`}>
                {groupedItems.groups[groupName].map((item, index) => {
                  const label = item.i18nKey ? translate(item.i18nKey) : item.label
                  const isItemDisabled = Boolean(item.disabled)
                  const itemIsActive = !isItemDisabled && !!item.href && isActive(item.href, item.exact)

                  return (
                    <SidebarMenuItem key={`${groupName}-${item.label}-${index}`}>
                      <SidebarMenuButton
                        asChild={!!item.href}
                        isActive={itemIsActive}
                        tooltip={label}
                        disabled={isItemDisabled}
                        aria-label={label}
                        aria-current={itemIsActive ? "page" : undefined}
                        aria-disabled={isItemDisabled}
                        onClick={!item.href ? () => {
                          item.action?.()
                          if (isMobile) setOpenMobile(false)
                        } : undefined}
                        className={cn(
                          "min-h-11 md:min-h-8 transition-all duration-200 pointer-events-auto relative z-10",
                          itemIsActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        )}
                      >
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (isMobile && !isQueryParamOnly(item.href)) {
                                setOpenMobile(false)
                              }
                            }}
                            className="flex items-center w-full h-full pointer-events-auto"
                          >
                            <span className={cn("shrink-0", itemIsActive ? "text-primary" : "text-muted-foreground/60")}>
                              {isLoading && itemIsActive ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                item.icon
                              )}
                            </span>
                            <span className="ml-3 truncate">{label}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center w-full">
                            <span className="shrink-0 text-muted-foreground/60">{item.icon}</span>
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
          <SidebarGroup className="px-2 mt-auto border-t border-sidebar-border/30 pt-4 pb-2">
            <SidebarMenu>{actions}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-2 relative z-20 pointer-events-auto bg-sidebar/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  aria-label="Open user menu"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground pointer-events-auto relative z-10"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar_url} alt={displayName} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                    <span className="truncate font-semibold text-sidebar-foreground">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email || "Free Plan"}</span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar_url} alt={displayName} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {timezone && (
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">Timezone</p>
                    <select
                      value={timezone.value}
                      onChange={(e) => timezone.onChange(e.target.value)}
                      className="w-full bg-transparent text-xs p-1 focus:outline-none cursor-pointer border rounded-md border-border/50 hover:border-border transition-colors"
                    >
                      {timezone.options.map((tz) => (
                        <option key={tz} value={tz} className="bg-sidebar">
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Log out</span>
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
