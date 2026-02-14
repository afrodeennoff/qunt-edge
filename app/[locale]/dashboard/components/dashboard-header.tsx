
"use client"

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useDashboard } from '@/app/[locale]/dashboard/dashboard-context';
import { AddWidgetSheet } from '@/app/[locale]/dashboard/components/add-widget-sheet';
import { cn } from '@/lib/utils';
import { FilterCommandMenu } from './filters/filter-command-menu';
import ImportButton from './import/import-button';
import { DailySummaryModal } from './daily-summary-modal';
import { ShareButton } from './share-button';
import { GlobalSyncButton } from './global-sync-button';
import { useI18n } from '@/locales/client';
import { useData } from '@/context/data-provider';
import { ActiveFilterTags } from './filters/active-filter-tags';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    CloudUpload,
    CheckCircle2,
    Sparkles,
    Trash2,
    RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DashboardHeader() {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const {
        isCustomizing,
        toggleCustomizing,
        addWidget,
        layouts,
        autoSaveStatus,
        flushPendingSaves,
        removeAllWidgets,
        restoreDefaultLayout
    } = useDashboard();
    const t = useI18n();
    const {
        isPlusUser,
        accountNumbers,
        instruments,
        dateRange,
        pnlRange,
        tagFilter,
        weekdayFilter,
    } = useData();
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
    const currentLayout = layouts || { desktop: [], mobile: [] };
    const sectionLabel = isDashboardRoot ? "Workspace" : "Dashboard";
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
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent_25%,transparent_75%,rgba(255,255,255,0.02))]" />
            <div className={cn("relative flex items-center justify-between gap-3 px-3 sm:px-6", isMobile ? "h-14" : "h-full")}>
                {/* Left Side: Sidebar Toggle & Title */}
                <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                    <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground h-9 w-9" />
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 hidden h-7 w-px bg-border/40 sm:block" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline-flex rounded-full border border-border/40 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {sectionLabel}
                                </span>
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
                    "flex items-center gap-2 rounded-2xl border border-border/40 bg-muted/20 p-1 shadow-sm",
                    isMobile && "max-w-[58vw] overflow-x-auto"
                )}>

                    {/* Global Utilities Group */}
                    <div className="flex shrink-0 items-center gap-1 rounded-xl bg-background/50 px-1 py-0.5 ring-1 ring-border/10">
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
                    {isDashboardRoot && isWidgetsTab && (
                        <div className="ml-1 flex shrink-0 items-center gap-1.5 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-1.5 shadow-sm ring-1 ring-white/5">
                            <button
                                type="button"
                                onClick={toggleCustomizing}
                                className={cn(
                                    "relative group flex h-8 items-center gap-2 rounded-lg transition-all duration-300",
                                    isMobile ? "w-8 justify-center px-0" : "px-3",
                                    isCustomizing
                                        ? "bg-primary text-primary-foreground shadow-none"
                                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                )}
                            >
                                <motion.div
                                    animate={{ rotate: isCustomizing ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {isCustomizing ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <Sparkles className="h-4 w-4" />
                                    )}
                                </motion.div>
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", isMobile && "sr-only")}>
                                    {isCustomizing ? t('widgets.done') : t('widgets.edit')}
                                </span>
                            </button>

                            {isCustomizing && (
                                <motion.div
                                    initial={isMobile ? false : { width: 0, opacity: 0, scale: 0.9 }}
                                    animate={isMobile ? undefined : { width: 'auto', opacity: 1, scale: 1 }}
                                    exit={isMobile ? undefined : { width: 0, opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="h-4 w-px bg-border/50 mx-0.5" />
                                    <AddWidgetSheet
                                        onAddWidget={addWidget}
                                        isCustomizing={isCustomizing}
                                    />

                                    {!isMobile && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                    title={t('widgets.restoreDefaults')}
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('widgets.restoreDefaultsConfirmTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('widgets.restoreDefaultsConfirmDescription')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={restoreDefaultLayout}>
                                                        {t('widgets.confirmRestoreDefaults')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}

                                    {!isMobile && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                                    title={t('widgets.deleteAll')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('widgets.deleteAllConfirmTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('widgets.deleteAllConfirmDescription')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={removeAllWidgets}
                                                        className="bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                                    >
                                                        {t('widgets.confirmDeleteAll')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}

                                    {autoSaveStatus.hasPending ? (
                                        <button
                                            type="button"
                                            onClick={flushPendingSaves}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors animate-pulse"
                                            title="Save Changes"
                                        >
                                            <CloudUpload className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center text-white/70" title="All changes saved">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {!isMobile && (
                                <>
                                    <div className="mx-1 h-4 w-px bg-border/50" />
                                    <ShareButton currentLayout={currentLayout} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-Navigation: Filters (Preserved Mapping) */}
            {isMobile ? (
                hasActiveFilters && (
                    <div className="relative px-3 pb-3 pt-1">
                        <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-1.5">
                            <ActiveFilterTags showAccountNumbers={true} />
                        </div>
                    </div>
                )
            ) : (
                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="relative px-4 pb-3 pt-1 sm:px-8"
                        >
                            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-1.5">
                                <ActiveFilterTags showAccountNumbers={true} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </header>
    );
}
