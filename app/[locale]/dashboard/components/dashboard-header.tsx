
"use client"

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useDashboardActions, useDashboardFilters } from '@/context/data-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import dynamic from 'next/dynamic';
import {
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

const FilterCommandMenu = dynamic(
    () => import('./filters/filter-command-menu').then((m) => m.FilterCommandMenu),
    { ssr: false }
)
const ImportButton = dynamic(() => import('./import/import-button'), { ssr: false })
const DailySummaryModal = dynamic(
    () => import('./daily-summary-modal').then((m) => m.DailySummaryModal),
    { ssr: false }
)
const GlobalSyncButton = dynamic(
    () => import('./global-sync-button').then((m) => m.GlobalSyncButton),
    { ssr: false }
)
const ActiveFilterTags = dynamic(
    () => import('./filters/active-filter-tags').then((m) => m.ActiveFilterTags),
    { ssr: false }
)
const DashboardHeaderWidgetControls = dynamic(
    () => import('./dashboard-header-widget-controls').then((m) => m.DashboardHeaderWidgetControls),
    { ssr: false }
)

export function DashboardHeader() {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const { isPlusUser } = useDashboardActions();
    const {
        accountNumbers,
        instruments,
        dateRange,
        pnlRange,
        tagFilter,
        weekdayFilter,
    } = useDashboardFilters();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'widgets';
    const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
    const isDashboardRoot = /^\/(?:[a-z]{2}(?:-[A-Za-z]{2})?)?\/dashboard$/i.test(normalizedPathname);
    const isWidgetsTab = activeTab === 'widgets';
    const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i);
    const billingHref = localeMatch?.[1] ? `/${localeMatch[1]}/dashboard/billing` : '/dashboard/billing';

    const getTitle = () => {
        if (isDashboardRoot) {
            if (activeTab === 'table') return 'Trades';
            if (activeTab === 'accounts') return 'Accounts';
            if (activeTab === 'chart') return 'Chart the Future';
            return 'Overview';
        }
        if (pathname.includes('strategies')) return 'Trade Desk';
        if (pathname.includes('reports')) return 'Analytics';
        if (pathname.includes('behavior')) return 'Behavior';
        if (pathname.includes('trader-profile')) return 'Trader Profile';
        if (pathname.includes('calendar')) return 'Calendar';
        if (pathname.includes('data')) return 'Data';
        if (pathname.includes('settings')) return 'Settings';
        if (pathname.includes('billing')) return 'Billing';
        return 'Dashboard';
    };

    const title = getTitle();
    const sectionLabel = isDashboardRoot ? "Workspace" : "Dashboard";
    const showSectionLabel = !(isDashboardRoot && activeTab === 'accounts');
    const subtitle = isDashboardRoot
        ? (
            activeTab === 'table'
                ? 'Review execution details, filters, and performance by trade.'
                : activeTab === 'accounts'
                    ? 'Track account growth, balances, and consistency in one place.'
                    : activeTab === 'chart'
                        ? 'Explore scenario planning and forward-looking projections.'
                        : 'Customize your layout and monitor your most important metrics.'
        )
        : 'Focus mode for analysis, execution, and daily workflow.';
    const hasActiveFilters =
        (accountNumbers?.length || 0) > 0 ||
        (instruments?.length || 0) > 0 ||
        Boolean(dateRange && (dateRange.from || dateRange.to)) ||
        Boolean(pnlRange && (pnlRange.min !== undefined || pnlRange.max !== undefined)) ||
        (tagFilter?.tags?.length || 0) > 0 ||
        Boolean(weekdayFilter?.days && weekdayFilter.days.length > 0);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 overflow-hidden border-b border-border/40 bg-background/95 backdrop-blur-xl",
                isMobile ? "pt-safe" : "h-14"
            )}
            data-dashboard-header="true"
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--foreground) / 0.35),transparent_25%,transparent_75%,hsl(var(--foreground) / 0.35))]" />
            <div className={cn("relative flex items-center justify-between gap-3 px-3 sm:px-6", isMobile ? "h-14" : "h-full")}>
                <div className="flex items-center gap-3 relative z-10 pointer-events-auto">
                    <SidebarTrigger className="h-11 w-11 md:h-7 md:w-7 text-muted-foreground hover:text-foreground" />
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 hidden h-7 w-px bg-border/40 sm:block" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                {showSectionLabel && (
                                    <span className="hidden sm:inline-flex rounded-full border border-border/40 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        {sectionLabel}
                                    </span>
                                )}
                                <h1 className="truncate whitespace-nowrap text-[11px] sm:text-sm font-bold uppercase tracking-[0.16em] text-foreground">
                                    {title}
                                </h1>
                            </div>
                            <p className="hidden truncate pt-1 text-xs text-muted-foreground lg:block">{subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Actions & Configuration */}
                <div className={cn(
                    "flex min-w-0 items-center gap-2",
                    isMobile
                        ? "rounded-none border-0 bg-transparent p-0 shadow-none"
                        : "rounded-2xl border border-border/40 bg-muted/20 p-1 shadow-sm"
                )}>
                    {/* Global Utilities Group */}
                    <div className={cn(
                        "flex shrink-0 items-center gap-1",
                        isMobile ? "" : "rounded-xl bg-background/50 px-1 py-0.5 ring-1 ring-border/10"
                    )}>
                        <FilterCommandMenu variant="navbar" />

                        {!isMobile && <GlobalSyncButton />}

                        {!isMobile && <DailySummaryModal />}
                    </div>

                    <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />

                    {/* Operations & Status Group */}
                    <div className="hidden sm:flex items-center gap-2">
                        <ImportButton />

                        {!isPlusUser() && (
                            <Link href={billingHref}>
                                <button className="group flex h-8 items-center gap-2 rounded-lg border border-border/60 bg-secondary px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-foreground transition-all hover:bg-accent hover:border-primary/50">
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    <span>UPGRADE</span>
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Customization Group (Conditional) */}
                    {isDashboardRoot && isWidgetsTab ? <DashboardHeaderWidgetControls isMobile={isMobile} /> : null}
                </div>
            </div>

            {/* Sub-Navigation: Filters (Preserved Mapping) */}
            {
                isMobile ? (
                    hasActiveFilters && (
                        <div className="relative px-3 pb-3 pt-1">
                            <div className="rounded-xl border border-border/60 bg-card/60 px-2 py-1.5">
                                <ActiveFilterTags showAccountNumbers={true} />
                            </div>
                        </div>
                    )
                ) : (
                    hasActiveFilters && (
                        <div className="relative px-4 pb-3 pt-1 sm:px-8">
                            <div className="rounded-xl border border-border/60 bg-card/60 px-2 py-1.5">
                                <ActiveFilterTags showAccountNumbers={true} />
                            </div>
                        </div>
                    )
                )
            }
        </header>
    );
}
