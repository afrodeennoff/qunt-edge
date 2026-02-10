"use client"

import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CreditCard,
  Database,
  Globe,
  LayoutDashboard,
  RefreshCw,
  Settings,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import ReferralButton from "@/components/referral-button"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions"

export function DashboardSidebar() {
  const { refreshAllData } = useData()
  const user = useUserStore(state => state.supabaseUser)
  const timezone = useUserStore(state => state.timezone)
  const setTimezone = useUserStore(state => state.setTimezone)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function check() {
      const status = await checkAdminStatus()
      setIsAdmin(status)
    }
    check()
  }, [])

  const navItems: UnifiedSidebarItem[] = [
    {
      href: "/dashboard?tab=widgets",
      icon: <LayoutDashboard className="size-4.5" />,
      label: "Dashboard",
      i18nKey: "landing.navbar.dashboard",
      group: "Overview"
    },
    {
      href: "/dashboard?tab=table",
      icon: <TrendingUp className="size-4.5" />,
      label: "Trades",
      i18nKey: "dashboard.trades",
      group: "Trading"
    },
    {
      href: "/dashboard?tab=chart",
      icon: <Sparkles className="size-4.5" />,
      label: "Chart the Future",
      group: "Trading"
    },
    {
      href: "/dashboard?tab=accounts",
      icon: <Activity className="size-4.5" />,
      label: "Accounts",
      i18nKey: "dashboard.accounts",
      group: "Trading"
    },
    {
      href: "/dashboard/strategies",
      icon: <BookOpen className="size-4.5" />,
      label: "Trade Desk",
      i18nKey: "dashboard.strategies",
      group: "Trading"
    },
    {
      href: "/dashboard/reports",
      icon: <BarChart3 className="size-4.5" />,
      label: "Reports",
      i18nKey: "dashboard.reports",
      group: "Analytics"
    },
    {
      href: "/dashboard/behavior",
      icon: <Brain className="size-4.5" />,
      label: "Behavior",
      i18nKey: "dashboard.behavior",
      group: "Analytics"
    },
    {
      href: "/teams/dashboard",
      icon: <Building2 className="size-4.5" />,
      label: "Team",
      i18nKey: "dashboard.teams",
      group: "Community"
    },
    {
      href: "/propfirms",
      icon: <Globe className="size-4.5" />,
      label: "Prop Firms",
      i18nKey: "footer.product.propfirms",
      group: "Community"
    },
    {
      href: "/dashboard/data",
      icon: <Database className="size-4.5" />,
      label: "Data",
      i18nKey: "dashboard.data",
      group: "System"
    },
    {
      icon: <RefreshCw className="size-4.5" />,
      label: "Sync",
      action: () => refreshAllData({ force: true }),
      group: "System"
    },
    {
      href: "/dashboard/billing",
      icon: <CreditCard className="size-4.5" />,
      label: "Billing",
      i18nKey: "dashboard.billing",
      group: "System"
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="size-4.5" />,
      label: "Settings",
      i18nKey: "dashboard.settings",
      group: "System"
    },
    ...(isAdmin ? [{
      href: "/admin",
      icon: <Shield className="size-4.5" />,
      label: "Admin",
      group: "System"
    }] : []),
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
      styleVariant="glassy"
      actions={
        <>
          <ReferralButton />
        </>
      }
      showSubscription={true}
      timezone={{
        value: timezone,
        options: timezones,
        onChange: setTimezone
      }}
      onLogout={handleLogout}
    />
  )
}
