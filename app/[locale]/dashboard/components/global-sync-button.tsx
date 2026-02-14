"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Settings2, ShieldCheck, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSyncContext } from "@/context/sync-context"
import { useRithmicSyncStore } from "@/store/rithmic-sync-store"
import { useData } from "@/context/data-provider"
import { toast } from "sonner"
import { useScopedI18n } from "@/locales/client"
import { getAllRithmicData } from "@/lib/rithmic-storage"
import { motion, AnimatePresence } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export function GlobalSyncButton() {
    const t = useScopedI18n('dashboard')
    const { rithmic, tradovate, manualSync } = useSyncContext()
    const { refreshAllData } = useData()
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Rithmic state
    const {
        isAutoSyncing: isRithmicSyncing,
        syncInterval: rithmicInterval,
        autoSyncEnabled: rithmicAutoEnabled,
        setAutoSyncEnabled: setRithmicAutoEnabled
    } = useRithmicSyncStore()

    // Tradovate state
    const isTradovateSyncing = tradovate.isAutoSyncing
    const isAnySyncing = isRithmicSyncing || isTradovateSyncing || isRefreshing

    const handleGlobalSync = useCallback(async () => {
        if (isAnySyncing) return

        setIsRefreshing(true)
        const toastId = toast.loading(t('refreshData'))

        try {
            // 1. Sync Rithmic
            const rithmicCredentials = getAllRithmicData()
            const rithmicIds = Object.keys(rithmicCredentials)

            for (const id of rithmicIds) {
                await manualSync('rithmic', id)
            }

            // 2. Sync Tradovate
            await tradovate.performSyncForAllAccounts()

            // 3. Refresh client data from DB
            await refreshAllData({ force: true })

            toast.success(t('refreshSuccess'), { id: toastId })
        } catch (error) {
            console.error("Global sync error:", error)
            toast.error(t('refreshError'), { id: toastId })
        } finally {
            setIsRefreshing(false)
        }
    }, [isAnySyncing, manualSync, tradovate, refreshAllData, t])

    // Calculate time until next auto-sync (approximate based on latest sync)
    const [nextSyncText, setNextSyncText] = useState<string>("")

    useEffect(() => {
        const updateNextSync = () => {
            const rithmicData = getAllRithmicData()
            const latestRithmicSync = Math.max(...Object.values(rithmicData).map(d => new Date(d.lastSyncTime).getTime()), 0)

            const tradovateSyncs = tradovate.accounts
            const latestTradovateSync = Math.max(...tradovateSyncs.map(a => new Date(a.lastSyncedAt).getTime()), 0)

            const lastSync = Math.max(latestRithmicSync, latestTradovateSync)
            if (lastSync === 0) {
                setNextSyncText("Never")
                return
            }

            const intervalMs = Math.min(rithmicInterval, tradovate.syncInterval) * 60 * 1000
            const nextSyncDate = new Date(lastSync + intervalMs)
            const diff = nextSyncDate.getTime() - Date.now()

            if (diff <= 0) {
                setNextSyncText("Due")
            } else {
                const mins = Math.floor(diff / 60000)
                const secs = Math.floor((diff % 60000) / 1000)
                setNextSyncText(`${mins}m ${secs}s`)
            }
        }

        const interval = setInterval(updateNextSync, 1000)
        updateNextSync()
        return () => clearInterval(interval)
    }, [rithmicInterval, tradovate.syncInterval, tradovate.accounts])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300",
                        isAnySyncing
                            ? "bg-accent/50 border-border text-foreground cursor-wait"
                            : "bg-background/50 border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-border"
                    )}
                >
                    <div className="relative">
                        <RefreshCw className={cn(
                            "w-4 h-4 transition-transform duration-700",
                            isAnySyncing ? "animate-spin" : "group-hover:rotate-180"
                        )} />
                        {isAnySyncing && (
                            <motion.div
                                className="absolute inset-0 bg-primary/20 blur-sm rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>

                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {isAnySyncing ? "Syncing" : "Sync"}
                        </span>
                        {!isAnySyncing && (rithmicAutoEnabled || tradovate.enableAutoSync) && (
                            <span className="text-[7px] text-muted-foreground font-bold group-hover:text-foreground transition-colors">
                                AUTO ON
                            </span>
                        )}
                    </div>

                    {/* Background Glow when syncing */}
                    {isAnySyncing && (
                        <div className="absolute inset-0 rounded-lg bg-primary/10 blur-md -z-10" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover border-border text-popover-foreground">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest">Sync Status</span>
                    {isAnySyncing ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] animate-pulse">Syncing...</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[8px]">Standby</Badge>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border" />

                <div className="p-2 space-y-3">
                    {/* Auto Sync Rithmic */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold">Rithmic Auto-Sync</span>
                            <span className="text-[8px] text-muted-foreground">Every {rithmicInterval} minutes</span>
                        </div>
                        <Switch
                            checked={rithmicAutoEnabled}
                            onCheckedChange={setRithmicAutoEnabled}
                        />
                    </div>

                    {/* Auto Sync Tradovate */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold">Tradovate Auto-Sync</span>
                            <span className="text-[8px] text-muted-foreground">Every {tradovate.syncInterval} minutes</span>
                        </div>
                        <Switch
                            checked={tradovate.enableAutoSync}
                            onCheckedChange={tradovate.setEnableAutoSync}
                        />
                    </div>
                </div>

                <DropdownMenuSeparator className="bg-border" />

                <div className="p-2">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Next Sync</span>
                        </div>
                        <span className="font-mono text-foreground">{nextSyncText}</span>
                    </div>

                    <button
                        onClick={handleGlobalSync}
                        disabled={isAnySyncing}
                        className="w-full h-8 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 text-secondary-foreground"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isAnySyncing && "animate-spin")} />
                        <span>Force Sync Now</span>
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
