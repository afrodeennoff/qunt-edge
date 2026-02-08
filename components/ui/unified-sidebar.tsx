"use client"

import React, { useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SubscriptionBadge } from "@/components/subscription-badge"
import { Logo, LogoText } from "@/components/logo"
import {
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Globe,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export type UnifiedSidebarStyle = "minimal" | "glassy"

const fastSpring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 30,
  mass: 0.65,
}

const subtleSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.72,
}

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

/**
 * Hook to handle active link logic
 */
function useActiveLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const normalizedPathname = useMemo(() => {
    if (!pathname) return ""
    return stripLocalePrefix(pathname)
  }, [pathname])

  const checkActive = useCallback(
    (href: string) => {
      if (!normalizedPathname) return false

      const [basePath, queryString] = href.split("?")
      const hrefParams = new URLSearchParams(queryString ?? "")
      const hrefTab = hrefParams.get("tab")

      // Handle tab-aware dashboard links
      if (basePath === "/dashboard" && hrefTab) {
        const activeTab = searchParams.get("tab") || "widgets"
        return normalizedPathname === "/dashboard" && activeTab === hrefTab
      }

      // Handle root dashboard route (widgets tab)
      if (basePath === "/dashboard") {
        return (
          normalizedPathname === "/dashboard" &&
          (searchParams.get("tab") || "widgets") === "widgets"
        )
      }

      // Handle root /teams/manage vs /teams/dashboard distinction
      if (basePath === "/teams/manage" && normalizedPathname.includes("/teams/manage")) {
        return true
      }

      if (basePath === "/teams/dashboard" && normalizedPathname.includes("/teams/dashboard")) {
        return true
      }

      // Default exact or nested match
      return (
        normalizedPathname === basePath ||
        normalizedPathname.startsWith(`${basePath}/`)
      )
    },
    [normalizedPathname, searchParams]
  )

  return { checkActive }
}

type SidebarState = "expanded" | "collapsed"

type SidebarItemProps = {
  item: UnifiedSidebarItem
  state: SidebarState
  active: boolean
  styleVariant: UnifiedSidebarStyle
  reduceMotion: boolean
}

const SIDEBAR_STYLE_CLASSES: Record<
  UnifiedSidebarStyle,
  {
    sidebar: string
    rail: string
    header: string
    brandCard: string
    brandIcon: string
    workspaceLabel: string
    userCard: string
    avatar: string
    avatarFallback: string
    content: string
    groupLabel: string
    groupLine: string
    itemTrack: string
    itemIconActive: string
    itemIconInactive: string
    itemButtonActive: string
    itemButtonInactive: string
    selectTrigger: string
    footer: string
    logout: string
    collapse: string
    edgeCollapse: string
  }
> = {
  minimal: {
    sidebar: "border-r border-border/60 bg-background",
    rail: "after:bg-border/70 after:transition-colors after:duration-200 hover:bg-accent/20 hover:after:bg-primary/35",
    header: "border-b border-border/60 px-2.5 py-2.5",
    brandCard: "flex h-12 items-center gap-2.5 overflow-hidden rounded-xl border border-border/60 bg-background px-2.5",
    brandIcon: "flex size-8.5 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-primary",
    workspaceLabel: "truncate text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80",
    userCard:
      "mx-0.5 flex items-center gap-3 rounded-xl border border-border/60 bg-background p-2.5 transition-colors duration-200 hover:border-border",
    avatar: "size-9 border border-border/60 ring-1 ring-border/30",
    avatarFallback: "bg-muted text-[11px] font-bold uppercase text-foreground",
    content: "flex flex-col px-2 py-2 overflow-hidden",
    groupLabel: "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
    groupLine: "h-px flex-1 bg-border/70",
    itemTrack: "bg-foreground/80",
    itemIconActive: "border-border/70 bg-background text-foreground",
    itemIconInactive:
      "border-border/60 bg-background text-muted-foreground group-hover/item:border-border group-hover/item:text-foreground",
    itemButtonActive: "border-border/70 bg-accent/50 text-foreground",
    itemButtonInactive: "hover:border-border/70 hover:bg-accent/35",
    selectTrigger:
      "h-9 rounded-xl border-input/60 bg-background text-[12px] font-medium hover:border-border focus:ring-sidebar-ring",
    footer: "border-t border-border/60 bg-background p-2.5",
    logout:
      "flex h-9 w-full items-center gap-3 rounded-xl px-3 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
    collapse:
      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/55 bg-background/90 text-muted-foreground shadow-sm transition-all duration-200 hover:border-border hover:bg-accent/35 hover:text-foreground",
    edgeCollapse:
      "absolute -right-3 top-16 z-30 hidden border border-border/60 bg-background/95 shadow-sm backdrop-blur-sm md:flex",
  },
  glassy: {
    sidebar:
      "border-r border-white/5 bg-[#030303] text-zinc-300",
    rail: "after:bg-white/5 after:transition-colors after:duration-200 hover:bg-teal-500/10 hover:after:bg-teal-500/40",
    header: "border-b border-white/5 px-4 py-4",
    brandCard:
      "flex h-10 items-center gap-3 overflow-hidden rounded-xl bg-transparent px-0 transition-all duration-300",
    brandIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/10 bg-teal-500/5 text-teal-400 relative overflow-hidden group",
    workspaceLabel: "truncate text-[9px] font-mono uppercase tracking-widest text-teal-500 mt-1",
    userCard:
      "mx-0 flex items-center gap-3 rounded-lg border border-transparent bg-transparent p-2 transition-colors duration-200 hover:bg-white/5",
    avatar: "size-9 border border-white/10 ring-1 ring-transparent group-hover:ring-teal-500/30 rounded-lg",
    avatarFallback: "bg-zinc-800 text-[10px] font-bold text-zinc-300",
    content: "flex flex-col px-3 py-4 overflow-x-hidden",
    groupLabel: "text-[9px] font-bold uppercase tracking-widest text-zinc-600 px-3 mb-2 animate-in fade-in slide-in-from-left-2",
    groupLine: "h-px flex-1 bg-white/5",
    itemTrack: "bg-teal-500 shadow-[0_0_10px_#2dd4bf]",
    itemIconActive:
      "text-teal-400",
    itemIconInactive:
      "text-zinc-500 group-hover/item:text-zinc-300",
    itemButtonActive:
      "bg-gradient-to-r from-teal-500/10 to-transparent text-white",
    itemButtonInactive: "hover:bg-white/5 hover:text-zinc-200 text-zinc-500",
    selectTrigger:
      "h-9 rounded-lg border-white/10 bg-zinc-900/50 text-[12px] font-medium hover:border-white/20 hover:text-white focus:ring-teal-500/50 transition-colors",
    footer: "border-t border-white/5 bg-[#020202] p-4",
    logout:
      "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 ml-auto",
    collapse:
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#030303] text-zinc-500 shadow-lg transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400 absolute -right-3 top-8 z-50",
    edgeCollapse:
      "absolute -right-3 top-8 z-50 hidden border border-white/10 bg-[#030303] shadow-lg md:flex",
  },
}

/**
 * Memoized individual sidebar item
 */
const SidebarItem = React.memo(({
  item,
  state,
  active,
  styleVariant,
  reduceMotion,
}: SidebarItemProps) => {
  const t = useI18n()
  const translate = t as unknown as (key: string) => string
  const label = item.i18nKey ? translate(item.i18nKey) : item.label
  const isDisabled = Boolean(item.disabled)
  const isLink = Boolean(item.href) && !isDisabled
  const styles = SIDEBAR_STYLE_CLASSES[styleVariant]
  const hoverAnimation =
    !reduceMotion && !isDisabled && state === "expanded" ? { x: 1 } : undefined
  const tapAnimation = !reduceMotion && !isDisabled ? { scale: 0.995 } : undefined

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }

    item.action?.()
  }

  const content = (
    <div className="flex items-center gap-3 w-full relative z-10">
      {active && (
        <motion.div
          layoutId="activeHighlight"
          className={cn("absolute left-0 w-0.5 h-6 rounded-r-full", styles.itemTrack)}
          transition={reduceMotion ? { duration: 0 } : fastSpring}
        />
      )}

      <motion.div
        className={cn(
          "relative flex size-5 shrink-0 items-center justify-center transition-all duration-200",
          active ? styles.itemIconActive : styles.itemIconInactive,
          isDisabled && "opacity-70"
        )}
        animate={
          reduceMotion
            ? undefined
            : { scale: active ? 1.02 : 1 }
        }
        transition={reduceMotion ? undefined : subtleSpring}
      >
        <div className="size-5 flex items-center justify-center">{item.icon}</div>
        {active && (
          /* Removed the glow background as we use gradient on the button now */
          null
        )}
      </motion.div>

      <motion.span
        className={cn(
          "truncate text-[13px] font-medium transition-colors group-data-[collapsible=icon]:hidden",
          active ? "font-semibold text-primary" : "text-muted-foreground group-hover/item:text-foreground",
          isDisabled && "text-muted-foreground/70"
        )}
        animate={
          reduceMotion || state === "collapsed"
            ? undefined
            : { x: active ? 0.5 : 0 }
        }
        transition={reduceMotion ? undefined : { duration: 0.16, ease: "easeOut" }}
      >
        {label}
      </motion.span>

      {item.badge && (
        <motion.span
          className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden"
          animate={reduceMotion ? undefined : { scale: active ? 1.02 : 1 }}
          transition={reduceMotion ? undefined : subtleSpring}
        >
          {item.badge}
        </motion.span>
      )}
    </div>
  )

  return (
    <SidebarMenuItem>
      <motion.div
        layout={!reduceMotion}
        transition={reduceMotion ? { duration: 0 } : subtleSpring}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
      >
        <SidebarMenuButton
          asChild={isLink}
          isActive={active}
          tooltip={state === "collapsed" ? label : undefined}
          onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled && !isLink}
          className={cn(
            "relative w-full flex items-center gap-3 px-3 py-3 rounded-lg flex-shrink-0 transition-all duration-200 group/item overflow-visible will-change-transform",
            active
              ? cn(styles.itemButtonActive)
              : styles.itemButtonInactive,
            isDisabled && "opacity-60"
          )}
        >
          {isLink ? (
            <Link href={item.href as string} aria-current={active ? "page" : undefined}>
              {content}
            </Link>
          ) : (
            content
          )}
        </SidebarMenuButton>
      </motion.div>
    </SidebarMenuItem>
  )
})

SidebarItem.displayName = "SidebarItem"

export function UnifiedSidebar({
  items,
  user,
  actions,
  showSubscription = true,
  timezone,
  onLogout,
  styleVariant = "minimal",
}: UnifiedSidebarConfig) {
  const { state, toggleSidebar } = useSidebar()
  const shouldReduceMotion = useReducedMotion()
  const { checkActive } = useActiveLink()
  const styles = SIDEBAR_STYLE_CLASSES[styleVariant]

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = useMemo(() => getUserInitials(user), [user])

  return (
    <Sidebar
      collapsible="icon"
      className={cn(styles.sidebar, "transition-colors duration-300")}
    >
      <SidebarRail className={styles.rail} />

      <SidebarHeader className={styles.header}>
        <div className="flex items-center">
          <motion.div
            className={cn(
              styles.brandCard,
              "min-w-0 flex-1 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
            )}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : subtleSpring}
          >
            <motion.div
              className={cn(
                styles.brandIcon,
                "ring-1 ring-inset ring-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.14)] group-data-[collapsible=icon]:size-8"
              )}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              transition={shouldReduceMotion ? undefined : subtleSpring}
            >
              <Logo className="size-5" />
              <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
            <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-white tracking-tight whitespace-nowrap leading-none text-lg">Qunt Edge</span>
              <span className={styles.workspaceLabel}>
                Terminal v2.4
              </span>
            </div>
          </motion.div>
        </div>


      </SidebarHeader>

      <motion.button
        type="button"
        aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggleSidebar}
        className={cn(styles.collapse, styles.edgeCollapse)}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        transition={shouldReduceMotion ? undefined : subtleSpring}
      >
        {state === "expanded" ? (
          <ChevronsLeft className="size-3.5" />
        ) : (
          <ChevronsRight className="size-3.5" />
        )}
      </motion.button>

      <SidebarContent className={styles.content}>
        <div className="flex h-full min-h-0 flex-col gap-2">
          <motion.div
            key="main-nav"
            layout={!shouldReduceMotion}
            transition={shouldReduceMotion ? { duration: 0 } : subtleSpring}
            className="flex flex-col gap-6"
          >
            {(() => {
              // Group items by their 'group' property
              const groupedItems = items.reduce((acc, item) => {
                const group = item.group || "Main";
                if (!acc[group]) acc[group] = [];
                acc[group].push(item);
                return acc;
              }, {} as Record<string, UnifiedSidebarItem[]>);

              // Define group order if needed, otherwise use insertion order
              // For now, we'll iterate through the keys in the order they were inserted (roughly)
              // But to respect the input array order, we can collect unique groups in order
              const groupOrder = items.reduce((acc, item) => {
                const group = item.group || "Main";
                if (!acc.includes(group)) acc.push(group);
                return acc;
              }, [] as string[]);

              return groupOrder.map((groupName) => (
                <SidebarGroup key={groupName} className="p-0">
                  {groupName !== "Main" && state === "expanded" && (
                    <div className={styles.groupLabel}>
                      {groupName}
                    </div>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                      {groupedItems[groupName].map((item, index) => (
                        <motion.div
                          key={`${item.href || item.label}-${index}`}
                          layout={!shouldReduceMotion}
                          transition={shouldReduceMotion ? { duration: 0 } : subtleSpring}
                        >
                          <SidebarItem
                            item={item}
                            state={state as SidebarState}
                            styleVariant={styleVariant}
                            reduceMotion={Boolean(shouldReduceMotion)}
                            active={!item.disabled && !!item.href && checkActive(item.href)}
                          />
                        </motion.div>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ));
            })()}
          </motion.div>

          <div className="mt-auto flex flex-col gap-2">
            {actions && state === "expanded" && (
              <SidebarGroup className="p-0 pt-2">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">{actions}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {timezone && state === "expanded" && (
              <SidebarGroup className="p-0 pt-1.5">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                      <div className="px-1.5">
                        <Select value={timezone.value} onValueChange={timezone.onChange}>
                          <SelectTrigger className={styles.selectTrigger}>
                            <div className="flex items-center gap-2 truncate">
                              <Globe className="size-3.5 text-muted-foreground" />
                              <SelectValue placeholder="Select timezone" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {timezone.options.map((tz) => (
                              <SelectItem key={tz} value={tz} className="text-[12px]">
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className={styles.footer}>
        <div className="flex flex-col gap-1.5">
          {user && state === "expanded" && (
            <motion.div
              className={styles.userCard}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? undefined : subtleSpring}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -1, scale: 1.005 }
              }
            >
              <Avatar className={styles.avatar}>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className={styles.avatarFallback}>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-foreground">
                    {displayName}
                  </span>
                  {showSubscription && (
                    <SubscriptionBadge className="origin-right scale-90 shadow-none" />
                  )}
                </div>
                <span className="block truncate text-[10px] text-zinc-500 font-mono">
                  ID: #8821-X
                </span>
              </div>
            </motion.div>
          )}

          {onLogout && (
            <motion.button
              type="button"
              onClick={onLogout}
              className={styles.logout}
              whileHover={shouldReduceMotion ? undefined : { x: 1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
              transition={shouldReduceMotion ? undefined : subtleSpring}
            >
              <LogOut className="size-4 shrink-0" />
              <span className="hidden">Logout</span>
            </motion.button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
