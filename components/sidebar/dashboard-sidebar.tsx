"use client"

import * as React from "react"
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

import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { useCurrentLocale } from "@/locales/client"
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

export function DashboardSidebar() {
    const { refreshAllData } = useData()
    const locale = useCurrentLocale()
    const user = useUserStore(state => state.supabaseUser)
    const timezone = useUserStore(state => state.timezone)
    const setTimezone = useUserStore(state => state.setTimezone)
    const resetUser = useUserStore(state => state.resetUser)
    const [isAdmin, setIsAdmin] = React.useState(false)

    React.useEffect(() => {
        async function check() {
            const status = await checkAdminStatus()
            setIsAdmin(status)
        }
        check()
    }, [])

    const handleLogout = async () => {
        resetUser()
        const { signOut } = await import("@/server/auth")
        await signOut()
    }

    const navItems: UnifiedSidebarItem[] = [
        {
            href: `/${locale}/dashboard?tab=widgets`,
            icon: <LayoutDashboard className="size-4.5" />,
            label: "Dashboard",
            group: "Overview"
        },
        {
            href: `/${locale}/dashboard?tab=table`,
            icon: <TrendingUp className="size-4.5" />,
            label: "Trades",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard?tab=chart`,
            icon: <Sparkles className="size-4.5" />,
            label: "Chart the Future",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard?tab=accounts`,
            icon: <Activity className="size-4.5" />,
            label: "Accounts",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard/trader-profile`,
            icon: <Brain className="size-4.5" />,
            label: "Trader Profile",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard/strategies`,
            icon: <BookOpen className="size-4.5" />,
            label: "Trade Desk",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard/reports`,
            icon: <BarChart3 className="size-4.5" />,
            label: "Reports",
            group: "Analytics"
        },
        {
            href: `/${locale}/dashboard/behavior`,
            icon: <Brain className="size-4.5" />,
            label: "Behavior",
            group: "Analytics"
        },
        {
            href: `/${locale}/teams/dashboard`,
            icon: <Building2 className="size-4.5" />,
            label: "Team",
            group: "Community"
        },
        {
            href: `/${locale}/propfirms`,
            icon: <Globe className="size-4.5" />,
            label: "Prop Firms",
            group: "Community"
        },
        {
            href: `/${locale}/dashboard/data`,
            icon: <Database className="size-4.5" />,
            label: "Data",
            group: "System"
        },
        {
            label: "Sync",
            icon: <RefreshCw className="size-4.5" />,
            action: () => refreshAllData({ force: true }),
            group: "System"
        },
        {
            href: `/${locale}/dashboard/billing`,
            icon: <CreditCard className="size-4.5" />,
            label: "Billing",
            group: "System"
        },
        {
            href: `/${locale}/dashboard/settings`,
            icon: <Settings className="size-4.5" />,
            label: "Settings",
            group: "System"
        },
        ...(isAdmin ? [{
            href: `/${locale}/admin`,
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

    return (
        <UnifiedSidebar
            items={navItems}
            user={user?.user_metadata ? {
                avatar_url: user.user_metadata.avatar_url,
                email: user.email,
                full_name: user.user_metadata.full_name
            } : undefined}
            styleVariant="minimal"
            timezone={{
                value: timezone,
                options: timezones,
                onChange: setTimezone
            }}
            onLogout={handleLogout}
        />
    )
}
