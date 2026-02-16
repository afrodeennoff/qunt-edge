"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Globe, LogOut } from "lucide-react"

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
  SidebarTrigger,
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
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/, "")
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
    const [hrefPath, queryString] = href.split("?")
    const basePath = stripLocalePrefix(hrefPath)
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
    container: string
    header: string
    footer: string
    logoWrap: string
    logoIcon: string
    brandName: string
    brandSub: string
    groupWrap: string
    userCard: string
    userName: string
    userMeta: string
    groupLabel: string
    menuButton: string
    menuButtonIdle: string
    menuButtonActive: string
    menuBadge: string
    timezoneTrigger: string
    footerButton: string
  }
> = {
  minimal: {
    sidebar: "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
    container: "bg-[radial-gradient(420px_300px_at_0%_-10%,hsl(var(--sidebar-accent)/0.22),transparent_70%)]",
    header: "border-b border-sidebar-border/70",
    footer: "border-t border-sidebar-border/70",
    logoWrap: "rounded-xl border border-sidebar-border/80 bg-sidebar-accent/45 shadow-[inset_0_1px_0_hsl(var(--sidebar-accent-foreground)/0.08)]",
    logoIcon: "text-sidebar-foreground",
    brandName: "text-sidebar-foreground",
    brandSub: "text-sidebar-foreground/55",
    groupWrap: "rounded-xl border border-sidebar-border/60 bg-sidebar-accent/20 px-1.5 py-1",
    userCard: "rounded-xl border border-sidebar-border/70 bg-sidebar-accent/35 p-2.5",
    userName: "text-sidebar-foreground",
    userMeta: "text-sidebar-foreground/62",
    groupLabel: "px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55",
    menuButton: "h-9 rounded-lg transition-all duration-150",
    menuButtonIdle: "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
    menuButtonActive: "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border)/0.8)]",
    menuBadge: "rounded-md bg-sidebar-accent/80 text-sidebar-accent-foreground",
    timezoneTrigger: "h-9 rounded-lg border-sidebar-border/70 bg-sidebar-accent/30",
    footerButton: "h-9 rounded-lg text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
  },
  glassy: {
    sidebar: "border-r border-white/10 bg-black/95 text-zinc-100 backdrop-blur-xl",
    container: "bg-[radial-gradient(420px_320px_at_0%_-5%,rgba(255,255,255,0.14),transparent_72%)]",
    header: "border-b border-white/10",
    footer: "border-t border-white/10",
    logoWrap: "rounded-xl border border-white/15 bg-white/[0.08]",
    logoIcon: "text-white",
    brandName: "text-white",
    brandSub: "text-zinc-400",
    groupWrap: "rounded-xl border border-white/10 bg-white/[0.03] px-1.5 py-1",
    userCard: "rounded-xl border border-white/10 bg-white/5 p-2.5",
    userName: "text-zinc-100",
    userMeta: "text-zinc-400",
    groupLabel: "px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500",
    menuButton: "h-9 rounded-lg transition-all duration-150",
    menuButtonIdle: "text-zinc-200/90 hover:bg-white/10 hover:text-zinc-100",
    menuButtonActive: "bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]",
    menuBadge: "rounded-md bg-white/15 text-zinc-100",
    timezoneTrigger: "h-9 rounded-lg border-white/10 bg-white/[0.04]",
    footerButton: "h-9 rounded-lg text-zinc-200/90 hover:bg-white/10 hover:text-zinc-100",
  },
  matte: {
    sidebar: "border-r border-white/5 bg-black text-zinc-200",
    container: "bg-[radial-gradient(420px_300px_at_0%_-10%,rgba(148,163,184,0.15),transparent_74%)]",
    header: "border-b border-white/5",
    footer: "border-t border-white/5",
    logoWrap: "rounded-xl border border-white/10 bg-zinc-900",
    logoIcon: "text-zinc-100",
    brandName: "text-zinc-100",
    brandSub: "text-zinc-500",
    groupWrap: "rounded-xl border border-white/10 bg-zinc-950 px-1.5 py-1",
    userCard: "rounded-xl border border-white/10 bg-zinc-950 p-2.5",
    userName: "text-zinc-100",
    userMeta: "text-zinc-400",
    groupLabel: "px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500",
    menuButton: "h-9 rounded-lg transition-all duration-150",
    menuButtonIdle: "text-zinc-300/90 hover:bg-zinc-800 hover:text-zinc-100",
    menuButtonActive: "bg-zinc-800 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
    menuBadge: "rounded-md bg-zinc-700 text-zinc-100",
    timezoneTrigger: "h-9 rounded-lg border-white/10 bg-zinc-900",
    footerButton: "h-9 rounded-lg text-zinc-300/90 hover:bg-zinc-800 hover:text-zinc-100",
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
  const { isMobile, setOpenMobile } = useSidebar()
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
    <Sidebar collapsible="icon" className={cn(styles.sidebar, styles.container)}>
      <SidebarHeader className={cn("h-16 flex items-center px-3", styles.header)}>
        <div className="flex items-center gap-2 w-full">
          <div className={cn("flex size-9 shrink-0 items-center justify-center", styles.logoWrap)}>
            <Logo className={cn("size-4.5", styles.logoIcon)} />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className={cn("truncate text-sm font-semibold tracking-tight", styles.brandName)}>
              Qunt Edge
            </p>
            <p className={cn("truncate text-[10px] uppercase tracking-[0.16em]", styles.brandSub)}>Trading Workspace</p>
          </div>
          <SidebarTrigger
            className="ml-auto hidden h-7 w-7 md:inline-flex"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-2.5">
            {groupedItems.order.map((groupName) => (
              <SidebarGroup key={groupName} className={cn("p-0", styles.groupWrap)}>
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
                      const menuButtonClass = cn(
                        styles.menuButton,
                        itemIsActive ? styles.menuButtonActive : styles.menuButtonIdle
                      )

                      return (
                        <SidebarMenuItem key={`${groupName}-${item.label}-${index}`}>
                          {item.href && !isItemDisabled ? (
                            <SidebarMenuButton
                              asChild
                              isActive={itemIsActive}
                              tooltip={label}
                              className={menuButtonClass}
                            >
                              <Link
                                href={item.href}
                                prefetch={false}
                                aria-current={itemIsActive ? "page" : undefined}
                                aria-label={label}
                                onClick={() => {
                                  if (isMobile) {
                                    setOpenMobile(false)
                                  }
                                }}
                              >
                                {item.icon}
                                <span className={cn("truncate", itemIsActive ? "font-semibold" : "font-medium")}>{label}</span>
                              </Link>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton
                              type="button"
                              tooltip={label}
                              disabled={isItemDisabled}
                              className={menuButtonClass}
                              onClick={() => {
                                item.action?.()
                                if (isMobile) {
                                  setOpenMobile(false)
                                }
                              }}
                            >
                              {item.icon}
                              <span className="truncate font-medium">{label}</span>
                            </SidebarMenuButton>
                          )}
                          {item.badge ? <SidebarMenuBadge className={styles.menuBadge}>{item.badge}</SidebarMenuBadge> : null}
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
                      <SelectTrigger className={styles.timezoneTrigger}>
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
              className={cn("w-full justify-start group-data-[collapsible=icon]:justify-center", styles.footerButton)}
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
