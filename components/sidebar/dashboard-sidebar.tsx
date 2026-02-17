"use client"

import * as React from "react"
import {
    Shield,
} from "lucide-react"

import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { useCurrentLocale } from "@/locales/client"
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import {
    SIDEBAR_TIMEZONE_OPTIONS,
    createDashboardNavigationItems,
    createDashboardSystemItems,
    logoutWithServerSignOut,
    toSidebarUser,
} from "@/components/sidebar/sidebar-helpers"

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
        await logoutWithServerSignOut(resetUser)
    }

    const navItems: UnifiedSidebarItem[] = [
        ...createDashboardNavigationItems(locale, {
            groups: {
                overview: "Overview",
                trading: "Trading",
                analytics: "Analytics",
                community: "Community",
            },
            includeTraderProfile: true,
        }),
        ...createDashboardSystemItems(locale, {
            onSync: () => refreshAllData({ force: true }),
        }),
        ...(isAdmin ? [{
            href: `/${locale}/admin`,
            icon: <Shield className="size-4.5" />,
            label: "Admin",
            group: "System",
        }] : []),
    ]

    return (
        <UnifiedSidebar
            items={navItems}
            user={toSidebarUser(user)}
            styleVariant="minimal"
            timezone={{
                value: timezone,
                options: SIDEBAR_TIMEZONE_OPTIONS,
                onChange: setTimezone,
            }}
            onLogout={handleLogout}
        />
    )
}
