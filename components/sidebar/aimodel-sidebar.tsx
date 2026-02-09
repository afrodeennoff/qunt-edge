
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useSearchParams, useParams } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useData } from "@/context/data-provider";
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions";
import { signOut } from "@/server/auth";
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

export function AIModelSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();
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
        resetUser();
        await signOut();
    };

    const navItems = useMemo<UnifiedSidebarItem[]>(() => {
        const isTeamPath = pathname.includes('/teams');
        const isAdminPath = pathname.includes('/admin');
        const items: UnifiedSidebarItem[] = [];

        if (isAdminPath) {
            items.push(
                { label: 'Mail', href: '/admin/newsletter-builder', icon: <Mail className="size-4.5" />, group: 'Admin Panel' },
                { label: 'ID', href: '/admin', icon: <Shield className="size-4.5" />, group: 'Admin Panel' }
            );
        } else if (isTeamPath) {
            items.push(
                { label: 'All Teams', href: '/teams/dashboard', icon: <Building2 className="size-4.5" />, group: 'Team Management' },
                { label: 'Team Overview', href: slug ? `/teams/dashboard/${slug}` : "/teams/dashboard", icon: <LayoutDashboard className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Analytics', href: slug ? `/teams/dashboard/${slug}/analytics` : "/teams/dashboard", icon: <BarChart3 className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Traders', href: slug ? `/teams/dashboard/${slug}/traders` : "/teams/dashboard", icon: <TrendingUp className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Members', href: slug ? `/teams/dashboard/${slug}/members` : "/teams/manage", icon: <Users className="size-4.5" />, disabled: !slug, group: 'Team Management' },
            );
        } else {
            items.push(
                { label: 'Dashboard', href: '/dashboard?tab=widgets', icon: <LayoutDashboard className="size-4.5" />, group: 'Inventory' },
                { label: 'Chart the Future', href: '/dashboard?tab=chart', icon: <Sparkles className="size-4.5" />, group: 'Inventory' },
                { label: 'Trades', href: '/dashboard?tab=table', icon: <TrendingUp className="size-4.5" />, group: 'Inventory' },
                { label: 'Accounts', href: '/dashboard?tab=accounts', icon: <Activity className="size-4.5" />, group: 'Inventory' },
                { label: 'Trade Desk', href: '/dashboard/strategies', icon: <BookOpen className="size-4.5" />, group: 'Inventory' },

                { label: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="size-4.5" />, group: 'Insights' },
                { label: 'Behavior', href: '/dashboard/behavior', icon: <Brain className="size-4.5" />, group: 'Insights' },

                { label: 'Team', href: '/teams/dashboard', icon: <Building2 className="size-4.5" />, group: 'Social' },
                { label: 'Prop Firms', href: '/propfirms', icon: <Globe className="size-4.5" />, group: 'Social' },
            );
        }

        if (isAdmin && !isAdminPath) {
            items.push(
                { label: 'Mail', href: '/admin/newsletter-builder', icon: <Mail className="size-4.5" />, group: 'Admin' },
                { label: 'ID', href: '/admin', icon: <Shield className="size-4.5" />, group: 'Admin' },
            );
        }

        items.push(
            { label: 'Data', href: '/dashboard/data', icon: <Database className="size-4.5" />, group: 'System' },
            { label: 'Export', icon: <Download className="size-4.5" />, action: () => setIsExportOpen(true), group: 'System' },
            { label: 'Sync', icon: <RefreshCw className="size-4.5" />, action: () => refreshAllData({ force: true }), group: 'System' },
            { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="size-4.5" />, group: 'System' },
            { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="size-4.5" />, group: 'System' },
        );

        if (isTeamPath || isAdminPath) {
            // We need to add 'Main Dashboard' to the start of the last group (System)
            // Or just add it as a separate item, but UnifiedSidebar groups by group name.
            // AIModelSidebar added it to 'System' group but unshift (first item).
            // Since 'System' items are added above, we can just unshift/splice into the array or filter.
            // Let's just create a specific item for it.
            const mainDashboardItem = { label: 'Main Dashboard', href: '/dashboard', icon: <LayoutDashboard className="size-4.5" />, group: 'System' };

            // Find index of first System item and insert before it, mostly to keep order?
            // Actually AIModelSidebar unshifted it to 'System' group, making it the first item in System group.
            // We can just add it before the other System items.

            // Let's redo the System push to include it first if needed.
            const systemItems: UnifiedSidebarItem[] = [
                { label: 'Data', href: '/dashboard/data', icon: <Database className="size-4.5" />, group: 'System' },
                { label: 'Export', icon: <Download className="size-4.5" />, action: () => setIsExportOpen(true), group: 'System' },
                { label: 'Sync', icon: <RefreshCw className="size-4.5" />, action: () => refreshAllData({ force: true }), group: 'System' },
                { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="size-4.5" />, group: 'System' },
                { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="size-4.5" />, group: 'System' },
            ];

            if (isTeamPath || isAdminPath) {
                systemItems.unshift({ label: 'Main Dashboard', href: '/dashboard', icon: <LayoutDashboard className="size-4.5" />, group: 'System' });
            }

            // Remove the simpler push above and use this
            items.splice(items.length - 5, 5); // remove the previous push (if I had done it, but I wrote it above)
            // Wait, I am writing the logic, so I can just do:
        }

        return items;
    }, [pathname, slug, isAdmin, refreshAllData]);

    // Correct logic for System group items to properly handle the Main Dashboard insert
    const finalNavItems = useMemo<UnifiedSidebarItem[]>(() => {
        const isTeamPath = pathname.includes('/teams');
        const isAdminPath = pathname.includes('/admin');
        const items: UnifiedSidebarItem[] = [];

        if (isAdminPath) {
            items.push(
                { label: 'Mail', href: '/admin/newsletter-builder', icon: <Mail className="size-4.5" />, group: 'Admin Panel' },
                { label: 'ID', href: '/admin', icon: <Shield className="size-4.5" />, group: 'Admin Panel' }
            );
        } else if (isTeamPath) {
            items.push(
                { label: 'All Teams', href: '/teams/dashboard', icon: <Building2 className="size-4.5" />, group: 'Team Management' },
                { label: 'Team Overview', href: slug ? `/teams/dashboard/${slug}` : "/teams/dashboard", icon: <LayoutDashboard className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Analytics', href: slug ? `/teams/dashboard/${slug}/analytics` : "/teams/dashboard", icon: <BarChart3 className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Traders', href: slug ? `/teams/dashboard/${slug}/traders` : "/teams/dashboard", icon: <TrendingUp className="size-4.5" />, disabled: !slug, group: 'Team Management' },
                { label: 'Team Members', href: slug ? `/teams/dashboard/${slug}/members` : "/teams/manage", icon: <Users className="size-4.5" />, disabled: !slug, group: 'Team Management' },
            );
        } else {
            items.push(
                { label: 'Dashboard', href: '/dashboard?tab=widgets', icon: <LayoutDashboard className="size-4.5" />, group: 'Inventory' },
                { label: 'Chart the Future', href: '/dashboard?tab=chart', icon: <Sparkles className="size-4.5" />, group: 'Inventory' },
                { label: 'Trades', href: '/dashboard?tab=table', icon: <TrendingUp className="size-4.5" />, group: 'Inventory' },
                { label: 'Accounts', href: '/dashboard?tab=accounts', icon: <Activity className="size-4.5" />, group: 'Inventory' },
                { label: 'Trade Desk', href: '/dashboard/strategies', icon: <BookOpen className="size-4.5" />, group: 'Inventory' },

                { label: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="size-4.5" />, group: 'Insights' },
                { label: 'Behavior', href: '/dashboard/behavior', icon: <Brain className="size-4.5" />, group: 'Insights' },

                { label: 'Team', href: '/teams/dashboard', icon: <Building2 className="size-4.5" />, group: 'Social' },
                { label: 'Prop Firms', href: '/propfirms', icon: <Globe className="size-4.5" />, group: 'Social' },
            );
        }

        if (isAdmin && !isAdminPath) {
            items.push(
                { label: 'Mail', href: '/admin/newsletter-builder', icon: <Mail className="size-4.5" />, group: 'Admin' },
                { label: 'ID', href: '/admin', icon: <Shield className="size-4.5" />, group: 'Admin' },
            );
        }

        // System items
        const systemItems: UnifiedSidebarItem[] = [
            { label: 'Data', href: '/dashboard/data', icon: <Database className="size-4.5" />, group: 'System' },
            { label: 'Export', icon: <Download className="size-4.5" />, action: () => setIsExportOpen(true), group: 'System' },
            { label: 'Sync', icon: <RefreshCw className="size-4.5" />, action: () => refreshAllData({ force: true }), group: 'System' },
            { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="size-4.5" />, group: 'System' },
            { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="size-4.5" />, group: 'System' },
        ];

        if (isTeamPath || isAdminPath) {
            systemItems.unshift({ label: 'Main Dashboard', href: '/dashboard', icon: <LayoutDashboard className="size-4.5" />, group: 'System' });
        }

        items.push(...systemItems);

        return items;
    }, [pathname, slug, isAdmin, refreshAllData]);

    return (
        <>
            <UnifiedSidebar
                items={finalNavItems}
                user={user?.user_metadata}
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
