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
  const match = pathname.match(/^\/teams\/dashboard\/([^/]+)(?:\/|$)/)
  const slug = pathname.includes("/teams/dashboard/trader/") ? undefined : match?.[1]

  const navItems: UnifiedSidebarItem[] = [
    {
      href: slug ? `/teams/dashboard/${slug}` : "/teams/dashboard",
      icon: <LayoutDashboard className="size-4.5" />,
      label: "Overview",
      group: "Team Overview"
    },
    {
      href: slug ? `/teams/dashboard/${slug}/analytics` : "/teams/dashboard",
      icon: <BarChart3 className="size-4.5" />,
      label: "Analytics",
      group: "Team Overview",
      disabled: !slug
    },
    {
      href: slug ? `/teams/dashboard/${slug}/traders` : "/teams/dashboard",
      icon: <TrendingUp className="size-4.5" />,
      label: "Traders",
      group: "Team Overview",
      disabled: !slug
    },
    {
      href: slug ? `/teams/dashboard/${slug}/members` : "/teams/manage",
      icon: <Users className="size-4.5" />,
      label: "Members & Roles",
      group: "Management"
    },
    {
      href: "/propfirms",
      icon: <Globe className="size-4.5" />,
      label: "Prop Firms",
      group: "Resources"
    },
    {
      href: "/dashboard",
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

  const handleLogout = () => {
    localStorage.removeItem('qunt_edge_user_data')
    window.location.href = '/authentication'
  }

  return (
    <UnifiedSidebar
      items={navItems}
      user={user?.user_metadata}
      styleVariant="minimal"
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
