
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
    const { isPlusUser } = useData();
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

    return (
        <header className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl" data-dashboard-header="true">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,90,235,0.07),transparent_25%,transparent_75%,rgba(34,90,235,0.05))]" />
            <div className="relative min-h-[72px] flex flex-wrap items-center justify-between gap-3 px-3 py-2 md:px-8">
                {/* Left Side: Sidebar Toggle & Title */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground" />
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 hidden h-7 w-px bg-white/20 sm:block" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                    {sectionLabel}
                                </span>
                                <h1 className="truncate whitespace-nowrap text-sm font-bold uppercase tracking-[0.16em] text-foreground">
                                    {title}
                                </h1>
                            </div>
                            <p className="hidden truncate pt-1 text-xs text-muted-foreground lg:block">{subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Actions & Configuration */}
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">

                    {/* Global Utilities Group */}
                    <div className="flex items-center gap-1 rounded-xl bg-white/[0.02] px-1 py-0.5">
                        <FilterCommandMenu variant="navbar" />

                        <GlobalSyncButton />

                        <DailySummaryModal />
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                    {/* Operations & Status Group */}
                    <div className="hidden sm:flex items-center gap-2">
                        <ImportButton />

                        {!isPlusUser() && (
                            <Link href={billingHref}>
                                <button className="group flex h-8 items-center gap-2 rounded-lg border border-[#225AEB]/30 bg-[#225AEB]/10 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#225AEB] transition-all hover:bg-[#225AEB]/20">
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    <span>UPGRADE</span>
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Customization Group (Conditional) */}
                    {isDashboardRoot && isWidgetsTab && (
                        <div className="ml-1 flex items-center gap-1.5 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-1.5 shadow-sm ring-1 ring-white/5">
                            <button
                                type="button"
                                onClick={toggleCustomizing}
                                className={cn(
                                    "relative group flex h-8 items-center gap-2 px-3 rounded-lg transition-all duration-300",
                                    isCustomizing
                                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
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
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {isCustomizing ? t('widgets.done') : t('widgets.edit')}
                                </span>
                            </button>

                            {isCustomizing && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0, scale: 0.9 }}
                                    animate={{ width: 'auto', opacity: 1, scale: 1 }}
                                    exit={{ width: 0, opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="h-4 w-px bg-border/50 mx-0.5" />
                                    <AddWidgetSheet
                                        onAddWidget={addWidget}
                                        isCustomizing={isCustomizing}
                                    />

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

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    {t('widgets.confirmDeleteAll')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    {autoSaveStatus.hasPending ? (
                                        <button
                                            type="button"
                                            onClick={flushPendingSaves}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors animate-pulse"
                                            title="Save Changes"
                                        >
                                            <CloudUpload className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center text-primary/70" title="All changes saved">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <div className="mx-1 h-4 w-px bg-border/50" />
                            <ShareButton currentLayout={currentLayout} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-Navigation: Filters (Preserved Mapping) */}
            <AnimatePresence>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="relative px-4 pb-3 pt-1 sm:px-8"
                >
                    <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-1.5">
                        <ActiveFilterTags showAccountNumbers={true} />
                    </div>
                </motion.div>
            </AnimatePresence>
        </header>
    );
}
