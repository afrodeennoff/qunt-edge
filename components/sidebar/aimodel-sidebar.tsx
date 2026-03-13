"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useDashboardActions, useDashboardStats } from "@/context/data-provider";
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions";
import { signOut } from "@/server/auth";
import { useCurrentLocale } from "@/locales/client";
import {
    LayoutDashboard,
    Sparkles,
    TrendingUp,
    Activity,
    BookOpen,
    BarChart3,
    Brain,
    Building2,
    Globe,
    Database,
    Download,
    RefreshCw,
    Settings,
    CreditCard,
    Shield,
    Mail,
    Users
} from "lucide-react";
import TradeExportDialog from '@/components/export-button';
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

type LocalePathBuilder = (path: string) => string

function buildAdminPanelItems(withLocale: LocalePathBuilder): UnifiedSidebarItem[] {
    return [
        { label: 'Mail', href: withLocale('/admin/newsletter-builder'), icon: <Mail className="size-4" />, group: 'Admin Panel' },
        { label: 'ID', href: withLocale('/admin'), icon: <Shield className="size-4" />, group: 'Admin Panel' },
    ]
}

function buildTeamManagementItems(withLocale: LocalePathBuilder, slug?: string): UnifiedSidebarItem[] {
    return [
        { label: 'All Teams', href: withLocale('/teams/dashboard'), icon: <Building2 className="size-4" />, group: 'Team Management' },
        { label: 'Team Overview', href: slug ? withLocale(`/teams/dashboard/${slug}`) : withLocale('/teams/dashboard'), icon: <LayoutDashboard className="size-4" />, disabled: !slug, group: 'Team Management' },
        { label: 'Team Analytics', href: slug ? withLocale(`/teams/dashboard/${slug}/analytics`) : withLocale('/teams/dashboard'), icon: <BarChart3 className="size-4" />, disabled: !slug, group: 'Team Management' },
        { label: 'Team Traders', href: slug ? withLocale(`/teams/dashboard/${slug}/traders`) : withLocale('/teams/dashboard'), icon: <TrendingUp className="size-4" />, disabled: !slug, group: 'Team Management' },
        { label: 'Team Members', href: slug ? withLocale(`/teams/dashboard/${slug}/members`) : withLocale('/teams/manage'), icon: <Users className="size-4" />, disabled: !slug, group: 'Team Management' },
    ]
}

function buildDefaultItems(withLocale: LocalePathBuilder): UnifiedSidebarItem[] {
    return [
        { label: 'Dashboard', href: withLocale('/dashboard?tab=widgets'), icon: <LayoutDashboard className="size-4" />, group: 'Inventory' },
        { label: 'Chart the Future', href: withLocale('/dashboard?tab=chart'), icon: <Sparkles className="size-4" />, group: 'Inventory' },
        { label: 'Trades', href: withLocale('/dashboard?tab=table'), icon: <TrendingUp className="size-4" />, group: 'Inventory' },
        { label: 'Accounts', href: withLocale('/dashboard?tab=accounts'), icon: <Activity className="size-4" />, group: 'Inventory' },
        { label: 'Trade Desk', href: withLocale('/dashboard/strategies'), icon: <BookOpen className="size-4" />, group: 'Inventory' },
        { label: 'Reports', href: withLocale('/dashboard/reports'), icon: <BarChart3 className="size-4" />, group: 'Insights' },
        { label: 'Behavior', href: withLocale('/dashboard/brain'), icon: <Brain className="size-4" />, group: 'Insights' },
        { label: 'Team', href: withLocale('/teams/dashboard'), icon: <Building2 className="size-4" />, group: 'Social' },
        { label: 'Prop Firms', href: withLocale('/propfirms'), icon: <Globe className="size-4" />, group: 'Social' },
        { label: 'Deals', href: withLocale('/prop-firm-deals'), icon: <Globe className="size-4" />, group: 'Social' },
    ]
}

function buildSystemItems(
    withLocale: LocalePathBuilder,
    isTeamPath: boolean,
    isAdminPath: boolean,
    onExport: () => void,
    onSync: () => void,
): UnifiedSidebarItem[] {
    const items: UnifiedSidebarItem[] = [
        { label: 'Data', href: withLocale('/dashboard/data'), icon: <Database className="size-4" />, group: 'System' },
        { label: 'Export', icon: <Download className="size-4" />, action: onExport, group: 'System' },
        { label: 'Sync', icon: <RefreshCw className="size-4" />, action: onSync, group: 'System' },
        { label: 'Settings', href: withLocale('/dashboard/settings'), icon: <Settings className="size-4" />, group: 'System' },
        { label: 'Billing', href: withLocale('/dashboard/billing'), icon: <CreditCard className="size-4" />, group: 'System' },
    ];

    if (isTeamPath || isAdminPath) {
        items.unshift({ label: 'Main Dashboard', href: withLocale('/dashboard'), icon: <LayoutDashboard className="size-4" />, group: 'System' });
    }

    return items
}

export function AIModelSidebar() {
    const pathname = usePathname();
    const params = useParams();
    const locale = useCurrentLocale();
    const slug = params?.slug as string | undefined;
    const { refreshAllData } = useDashboardActions();
    const { formattedTrades } = useDashboardStats();
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
        resetUser();
        await signOut();
    };

    const withLocale = useCallback(
        (path: string) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`,
        [locale]
    );

    const finalNavItems = useMemo<UnifiedSidebarItem[]>(() => {
        const isTeamPath = pathname.includes('/teams');
        const isAdminPath = pathname.includes('/admin');
        const items = isAdminPath
            ? buildAdminPanelItems(withLocale)
            : isTeamPath
                ? buildTeamManagementItems(withLocale, slug)
                : buildDefaultItems(withLocale)

        if (isAdmin && !isAdminPath) {
            items.push(...buildAdminPanelItems(withLocale).map((item) => ({ ...item, group: 'Admin' })))
        }

        items.push(
            ...buildSystemItems(
                withLocale,
                isTeamPath,
                isAdminPath,
                () => setIsExportOpen(true),
                () => refreshAllData({ force: true }),
            ),
        )

        return items
    }, [pathname, slug, isAdmin, refreshAllData, withLocale]);

    return (
        <>
            <UnifiedSidebar
                items={finalNavItems}
                user={{
                    avatar_url: user?.user_metadata?.avatar_url,
                    email: user?.email,
                    full_name: user?.user_metadata?.full_name
                }}
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
