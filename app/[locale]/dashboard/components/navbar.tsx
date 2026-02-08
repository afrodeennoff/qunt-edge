'use client'

import { useState } from 'react'
import {
  Pencil,
  RefreshCw,
  Sparkles,
  CloudUpload,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import ImportButton from './import/import-button'
import { useKeyboardShortcuts } from '../../../../hooks/use-keyboard-shortcuts'
import { ActiveFilterTags } from './filters/active-filter-tags'
import { AnimatePresence, motion } from 'framer-motion'
import { FilterCommandMenu } from './filters/filter-command-menu'
import { useDashboard } from '../dashboard-context'
import { AddWidgetSheet } from './add-widget-sheet'
import { ShareButton } from './share-button'
import { useData } from '@/context/data-provider'
import { cn } from '@/lib/utils'
import { DailySummaryModal } from './daily-summary-modal'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PnLSummary } from './pnl-summary'

export default function Navbar() {
  const {
    isCustomizing,
    toggleCustomizing,
    addWidget,
    layouts,
    autoSaveStatus,
    flushPendingSaves
  } = useDashboard()
  const { refreshAllData, isPlusUser, isLoading } = useData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshAllData({ force: true })
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  const currentLayout = layouts || { desktop: [], mobile: [] }

  return (
    <div className="sticky top-0 z-40 w-full px-3 sm:px-6 py-3 sm:py-4 pointer-events-none">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex flex-col glass-strong rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-accent-teal/10 hover:border-white/20"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">

          {/* Left Side: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 text-fg-muted hover:text-fg-primary hover:bg-white/10 transition-all rounded-2xl w-10 h-10" />
            <div className="h-6 w-px bg-white/10 hidden sm:block mx-1" />
          </div>

          {/* Center: PnL Metrics (Desktop Only) */}
          <div className="hidden md:flex flex-1 max-w-2xl px-4">
            <PnLSummary />
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3">

            {/* Config Group */}
            <div className="hidden md:flex items-center gap-1.5 p-1.5 bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-white/5">
              <Button
                id="customize-mode"
                variant="ghost"
                size="sm"
                onClick={toggleCustomizing}
                className={cn(
                  "h-9 px-4 gap-2 rounded-xl transition-all duration-500",
                  isCustomizing
                    ? "bg-accent-teal text-white shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:bg-accent-teal-hover"
                    : "text-fg-muted hover:text-fg-primary hover:bg-white/10"
                )}
              >
                <Pencil className={cn("w-3.5 h-3.5", isCustomizing && "animate-pulse")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isCustomizing ? "Lock Grid" : "Edit Layout"}</span>
              </Button>

              {isCustomizing && autoSaveStatus.hasPending && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={flushPendingSaves}
                  className="h-9 px-3 gap-2 rounded-xl text-accent-teal hover:bg-accent-teal/10 transition-all border border-accent-teal/20"
                >
                  <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Save Now</span>
                </Button>
              )}

              {!autoSaveStatus.hasPending && isCustomizing && (
                <div className="flex items-center gap-2 px-3 text-accent-teal/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
                </div>
              )}

              <AddWidgetSheet onAddWidget={addWidget} isCustomizing={isCustomizing} />

              <div className="w-px h-5 bg-white/10 mx-1" />

              <ShareButton currentLayout={currentLayout} />
            </div>

            {/* Performance & Search Group */}
            <div className="flex items-center gap-2">
              <FilterCommandMenu variant="navbar" />

              <div className="hidden sm:flex items-center gap-2">
                <ImportButton />

                {!isPlusUser() && (
                  <Link href="/dashboard/billing">
                    <Button variant="ghost" size="sm" className="h-9 px-5 gap-2 rounded-xl bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] hover:border-amber-500/50 hover:from-amber-500/30 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Elite</span>
                    </Button>
                  </Link>
                )}
              </div>

              <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

              {/* Real-time Actions */}
              <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-8 w-8 rounded-xl text-fg-muted hover:text-fg-primary hover:bg-white/10 transition-all active:scale-90"
                  title="Manual Sync"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 transition-transform duration-1000", (isRefreshing || isLoading) && "animate-spin")} />
                </Button>
                <DailySummaryModal />
              </div>
            </div>

          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <PnLSummary className="w-full" />
        </div>

        {/* Dynamic Filters Bar */}
        <AnimatePresence>
          <div className="px-8 pb-3 flex flex-wrap gap-2">
            <ActiveFilterTags showAccountNumbers={true} />
          </div>
        </AnimatePresence>
      </motion.nav>
    </div>
  )
}
