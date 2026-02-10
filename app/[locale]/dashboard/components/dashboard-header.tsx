
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
        if (pathname.includes('calendar')) return 'Calendar';
        if (pathname.includes('data')) return 'Data';
        if (pathname.includes('settings')) return 'Settings';
        if (pathname.includes('billing')) return 'Billing';
        return 'Dashboard';
    };

    const title = getTitle();
    const currentLayout = layouts || { desktop: [], mobile: [] };

    return (
        <header className="sticky top-0 z-50 overflow-hidden border-b border-border/70 bg-background/95 backdrop-blur-md">
            <div className="min-h-[64px] flex flex-wrap items-center justify-between gap-2 px-3 md:px-8">
                {/* Left Side: Sidebar Toggle & Title */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground" />
                    <div className="flex items-baseline gap-3">
                        <h1 className="whitespace-nowrap text-sm font-bold uppercase tracking-wide text-foreground">{title}</h1>
                    </div>
                </div>

                {/* Right Side: Actions & Configuration */}
                <div className="flex items-center gap-2">

                    {/* Global Utilities Group */}
                    <div className="flex items-center gap-1">
                        <FilterCommandMenu variant="navbar" />

                        <GlobalSyncButton />

                        <DailySummaryModal />
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                    {/* Operations & Status Group */}
                    <div className="hidden sm:flex items-center gap-2">
                        <ImportButton />

                        {!isPlusUser() && (
                            <Link href="/dashboard/billing">
                                <button className="group flex h-8 items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 text-[9px] font-black uppercase tracking-widest text-primary transition-all hover:border-primary/50 hover:bg-primary/20">
                                    <Sparkles className="h-3 w-3 animate-pulse transition-transform group-hover:scale-110" />
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
                    className="px-4 pb-3 -mt-1 sm:px-8"
                >
                    <ActiveFilterTags showAccountNumbers={true} />
                </motion.div>
            </AnimatePresence>
        </header>
    );
}
