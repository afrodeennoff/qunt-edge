"use client"

import { LayoutDashboard, Users, BarChart3, TrendingUp, Globe, ArrowLeft } from "lucide-react"
import { useUserStore } from "@/store/user-store"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { usePathname } from "next/navigation"

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
      group: "Team Overview",
      exact: true
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

  const timezones = [
    'UTC',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ]

  const resetUser = useUserStore(state => state.resetUser)

  const handleLogout = async () => {
    resetUser()
    const { signOut } = await import("@/server/auth")
    await signOut()
  }

  return (
    <UnifiedSidebar
      items={navItems}
      user={{
        avatar_url: user?.user_metadata?.avatar_url,
        email: user?.email,
        full_name: user?.user_metadata?.full_name
      }}
      showSubscription={false}
      timezone={{
        value: timezone,
        options: timezones,
        onChange: setTimezone
      }}
      onLogout={handleLogout}
    />
  )
}
