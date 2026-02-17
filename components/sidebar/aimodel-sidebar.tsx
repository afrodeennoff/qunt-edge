"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useData } from "@/context/data-provider";
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions";
import { useCurrentLocale } from "@/locales/client";
import {
    LayoutDashboard,
    BarChart3,
    Building2,
    Shield,
    Mail,
    TrendingUp,
    Users
} from "lucide-react";
import TradeExportDialog from '@/components/export-button';
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import {
    createDashboardNavigationItems,
    createDashboardSystemItems,
    logoutWithServerSignOut,
    toSidebarUser,
} from "@/components/sidebar/sidebar-helpers"

export function AIModelSidebar() {
    const pathname = usePathname();
    const params = useParams();
    const locale = useCurrentLocale();
    const slug = params?.slug as string | undefined;
    const { refreshAllData, formattedTrades } = useData();
    const user = useUserStore(state => state.supabaseUser);
    const resetUser = useUserStore(state => state.resetUser);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    useEffect(() => {
        async function check() {
            const status = await checkAdminStatus();
            setIsAdmin(status);
        }
        check();
    }, []);

    const handleLogout = async () => {
        await logoutWithServerSignOut(resetUser);
    };

    const withLocale = useCallback(
        (path: string) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`,
        [locale]
    );

    // Correct logic for System group items to properly handle the Main Dashboard insert
    const finalNavItems = useMemo<UnifiedSidebarItem[]>(() => {
        const isTeamPath = pathname.includes('/teams');
        const isAdminPath = pathname.includes('/admin');
        const items: UnifiedSidebarItem[] = [];

        if (isAdminPath) {
            items.push(
                { label: 'Mail', href: withLocale('/admin/newsletter-builder'), icon: <Mail className="size-4.5" />, group: 'Admin Panel' },
                { label: 'ID', href: withLocale('/admin'), icon: <Shield className="size-4.5" />, group: 'Admin Panel' }
            );
        } else if (isTeamPath) {
            items.push(
                { label: 'All Teams', href: withLocale('/teams/dashboard'), icon: <Building2 className="size-4.5" />, group: 'Team Management' },
                { label: 'Team Overview', href: slug ? withLocale(`/teams/dashboard/${slug}`) : withLocale('/teams/dashboard'), icon: <LayoutDashboard className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Analytics', href: slug ? withLocale(`/teams/dashboard/${slug}/analytics`) : withLocale('/teams/dashboard'), icon: <BarChart3 className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Traders', href: slug ? withLocale(`/teams/dashboard/${slug}/traders`) : withLocale('/teams/dashboard'), icon: <TrendingUp className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Members', href: slug ? withLocale(`/teams/dashboard/${slug}/members`) : withLocale('/teams/manage'), icon: <Users className="size-4.5" />, disabled: !slug, group: 'Team Management' },
            );
        } else {
            items.push(
                ...createDashboardNavigationItems(locale, {
                    groups: {
                        overview: "Inventory",
                        trading: "Inventory",
                        analytics: "Insights",
                        community: "Social",
                    },
                    includeTraderProfile: false,
                }),
            )
        }

        if (isAdmin && !isAdminPath) {
            items.push(
                { label: 'Mail', href: withLocale('/admin/newsletter-builder'), icon: <Mail className="size-4.5" />, group: 'Admin' },
                { label: 'ID', href: withLocale('/admin'), icon: <Shield className="size-4.5" />, group: 'Admin' },
            );
        }

        const systemItems = createDashboardSystemItems(locale, {
            onSync: () => refreshAllData({ force: true }),
            onExport: () => setIsExportOpen(true),
            includeMainDashboard: isTeamPath || isAdminPath,
        })

        items.push(...systemItems);

        return items;
    }, [locale, pathname, slug, isAdmin, refreshAllData, withLocale]);

    return (
        <>
            <UnifiedSidebar
                items={finalNavItems}
                user={toSidebarUser(user)}
                styleVariant="glassy"
                onLogout={handleLogout}
            />

            <TradeExportDialog
                trades={formattedTrades}
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
            />
        </>
    );
}
