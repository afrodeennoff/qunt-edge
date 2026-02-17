"use client"

import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CreditCard,
  Database,
  Download,
  Globe,
  LayoutDashboard,
  RefreshCw,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

export const SIDEBAR_TIMEZONE_OPTIONS = [
  "UTC",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
]

type DashboardGroupSet = {
  overview: string
  trading: string
  analytics: string
  community: string
}

const DEFAULT_GROUPS: DashboardGroupSet = {
  overview: "Overview",
  trading: "Trading",
  analytics: "Analytics",
  community: "Community",
}

export function toSidebarUser(user?: User | null) {
  if (!user?.user_metadata) return undefined

  return {
    avatar_url: user.user_metadata.avatar_url as string | undefined,
    email: user.email,
    full_name: user.user_metadata.full_name as string | undefined,
  }
}

export function createDashboardNavigationItems(
  locale: string,
  options?: {
    groups?: Partial<DashboardGroupSet>
    includeTraderProfile?: boolean
  }
): UnifiedSidebarItem[] {
  const groups: DashboardGroupSet = {
    ...DEFAULT_GROUPS,
    ...(options?.groups ?? {}),
  }
  const includeTraderProfile = options?.includeTraderProfile ?? true

  const items: UnifiedSidebarItem[] = [
    {
      href: `/${locale}/dashboard?tab=widgets`,
      icon: <LayoutDashboard className="size-4.5" />,
      label: "Dashboard",
      group: groups.overview,
    },
    {
      href: `/${locale}/dashboard?tab=table`,
      icon: <TrendingUp className="size-4.5" />,
      label: "Trades",
      group: groups.trading,
    },
    {
      href: `/${locale}/dashboard?tab=chart`,
      icon: <Sparkles className="size-4.5" />,
      label: "Chart the Future",
      group: groups.trading,
    },
    {
      href: `/${locale}/dashboard?tab=accounts`,
      icon: <Activity className="size-4.5" />,
      label: "Accounts",
      group: groups.trading,
    },
    {
      href: `/${locale}/dashboard/strategies`,
      icon: <BookOpen className="size-4.5" />,
      label: "Trade Desk",
      group: groups.trading,
    },
    {
      href: `/${locale}/dashboard/reports`,
      icon: <BarChart3 className="size-4.5" />,
      label: "Reports",
      group: groups.analytics,
    },
    {
      href: `/${locale}/dashboard/behavior`,
      icon: <Brain className="size-4.5" />,
      label: "Behavior",
      group: groups.analytics,
    },
    {
      href: `/${locale}/teams/dashboard`,
      icon: <Building2 className="size-4.5" />,
      label: "Team",
      group: groups.community,
    },
    {
      href: `/${locale}/propfirms`,
      icon: <Globe className="size-4.5" />,
      label: "Prop Firms",
      group: groups.community,
    },
  ]

  if (includeTraderProfile) {
    items.splice(4, 0, {
      href: `/${locale}/dashboard/trader-profile`,
      icon: <Brain className="size-4.5" />,
      label: "Trader Profile",
      group: groups.trading,
    })
  }

  return items
}

export function createDashboardSystemItems(
  locale: string,
  options: {
    onSync: () => void
    onExport?: () => void
    includeMainDashboard?: boolean
  }
): UnifiedSidebarItem[] {
  const items: UnifiedSidebarItem[] = [
    {
      href: `/${locale}/dashboard/data`,
      icon: <Database className="size-4.5" />,
      label: "Data",
      group: "System",
    },
    {
      label: "Sync",
      icon: <RefreshCw className="size-4.5" />,
      action: options.onSync,
      group: "System",
    },
    {
      href: `/${locale}/dashboard/settings`,
      icon: <Settings className="size-4.5" />,
      label: "Settings",
      group: "System",
    },
    {
      href: `/${locale}/dashboard/billing`,
      icon: <CreditCard className="size-4.5" />,
      label: "Billing",
      group: "System",
    },
  ]

  if (options.onExport) {
    items.splice(1, 0, {
      label: "Export",
      icon: <Download className="size-4.5" />,
      action: options.onExport,
      group: "System",
    })
  }

  if (options.includeMainDashboard) {
    items.unshift({
      href: `/${locale}/dashboard`,
      icon: <LayoutDashboard className="size-4.5" />,
      label: "Main Dashboard",
      group: "System",
    })
  }

  return items
}

export async function logoutWithServerSignOut(
  resetUser: () => void,
  redirectPath = "/"
) {
  const { signOutWithoutRedirect } = await import("@/server/auth")
  await signOutWithoutRedirect()
  resetUser()
  window.location.assign(redirectPath)
}
