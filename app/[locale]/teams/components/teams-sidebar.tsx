"use client"

import { LayoutDashboard, Users, BarChart3, TrendingUp, Globe, ArrowLeft } from "lucide-react"
import { useUserStore } from "@/store/user-store"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { usePathname } from "next/navigation"
import {
  SIDEBAR_TIMEZONE_OPTIONS,
  logoutWithServerSignOut,
  toSidebarUser,
} from "@/components/sidebar/sidebar-helpers"

export function TeamsSidebar() {
  const user = useUserStore(state => state.supabaseUser)
  const timezone = useUserStore(state => state.timezone)
  const setTimezone = useUserStore(state => state.setTimezone)
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const teamsIndex = segments.indexOf('teams')
  const hasLocalePrefix = teamsIndex === 1
  const localePrefix = hasLocalePrefix ? `/${segments[0]}` : ''
  const teamsRoot = `${localePrefix}/teams`
  const dashboardRoot = `${teamsRoot}/dashboard`
  const slug =
    teamsIndex !== -1 &&
    segments[teamsIndex + 1] === 'dashboard' &&
    segments[teamsIndex + 2] &&
    segments[teamsIndex + 2] !== 'trader'
      ? segments[teamsIndex + 2]
      : undefined

  const navItems: UnifiedSidebarItem[] = [
    {
      href: slug ? `${dashboardRoot}/${slug}` : dashboardRoot,
      icon: <LayoutDashboard className="size-4.5" />,
      label: "Overview",
      group: "Team Overview"
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/analytics` : dashboardRoot,
      icon: <BarChart3 className="size-4.5" />,
      label: "Analytics",
      group: "Team Overview",
      disabled: !slug
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/traders` : dashboardRoot,
      icon: <TrendingUp className="size-4.5" />,
      label: "Traders",
      group: "Team Overview",
      disabled: !slug
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/members` : `${teamsRoot}/manage`,
      icon: <Users className="size-4.5" />,
      label: "Members & Roles",
      group: "Management"
    },
    {
      href: `${localePrefix}/propfirms`,
      icon: <Globe className="size-4.5" />,
      label: "Prop Firms",
      group: "Resources"
    },
    {
      href: `${localePrefix}/dashboard`,
      icon: <ArrowLeft className="size-4.5" />,
      label: "Main Dashboard",
      group: "System"
    },
  ]

  const resetUser = useUserStore(state => state.resetUser)

  const handleLogout = async () => {
    await logoutWithServerSignOut(resetUser)
  }

  return (
    <UnifiedSidebar
      items={navItems}
      user={toSidebarUser(user)}
      styleVariant="minimal"
      showSubscription={false}
      timezone={{
        value: timezone,
        options: SIDEBAR_TIMEZONE_OPTIONS,
        onChange: setTimezone
      }}
      onLogout={handleLogout}
    />
  )
}
