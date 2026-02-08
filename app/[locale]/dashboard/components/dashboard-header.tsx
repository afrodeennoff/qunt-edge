
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
import { useData } from '@/context/data-provider';
import { ActiveFilterTags } from './filters/active-filter-tags';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CloudUpload,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

export function DashboardHeader() {
    const pathname = usePathname();
    const {
        isCustomizing,
        toggleCustomizing,
        addWidget,
        layouts,
        autoSaveStatus,
        flushPendingSaves
    } = useDashboard();
    const { isPlusUser } = useData();
    const searchParams = useSearchParams();

    const getTitle = () => {
        const tab = searchParams.get('tab');
        // Check if we are on the dashboard root (handling possible locale prefix)
        const isDashboardRoot = pathname === '/dashboard' || pathname.match(/\/[a-z]{2}\/dashboard$/);

        if (isDashboardRoot) {
            if (tab === 'table') return 'Trades';
            if (tab === 'accounts') return 'Accounts';
            if (tab === 'chart') return 'Chart the Future';
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
                    {title === 'Overview' && (
                        <div className="ml-1 flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/70 p-1">
                            <AddWidgetSheet
                                onAddWidget={addWidget}
                                isCustomizing={isCustomizing}
                                trigger={
                                    <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                                        <span>+ ADD</span>
                                    </button>
                                }
                            />

                            <button
                                onClick={toggleCustomizing}
                                className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all duration-300 border",
                                    isCustomizing
                                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.25)]"
                                        : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                {isCustomizing ? 'LOCK' : 'EDIT'}
                            </button>

                            {isCustomizing && autoSaveStatus.hasPending && (
                                <button
                                    onClick={flushPendingSaves}
                                    className="animate-pulse rounded-md p-1.5 text-primary transition-all hover:bg-primary/10"
                                    title="Save Changes"
                                >
                                    <CloudUpload className="w-4 h-4" />
                                </button>
                            )}

                            {!autoSaveStatus.hasPending && isCustomizing && (
                                <div className="px-2 text-primary/70">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}

                            <div className="mx-1 h-4 w-px bg-border/70" />
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
