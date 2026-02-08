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
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-400 cursor-wait"
                            : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10"
                    )}
                >
                    <div className="relative">
                        <RefreshCw className={cn(
                            "w-4 h-4 transition-transform duration-700",
                            isAnySyncing ? "animate-spin" : "group-hover:rotate-180"
                        )} />
                        {isAnySyncing && (
                            <motion.div
                                className="absolute inset-0 bg-teal-400/20 blur-sm rounded-full"
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
                            <span className="text-[7px] text-teal-500/70 font-bold group-hover:text-teal-400 transition-colors">
                                AUTO ON
                            </span>
                        )}
                    </div>

                    {/* Background Glow when syncing */}
                    {isAnySyncing && (
                        <div className="absolute inset-0 rounded-lg bg-teal-500/5 blur-md -z-10" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0a] border-white/10 text-zinc-200">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Sync Status</span>
                    {isAnySyncing ? (
                        <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[8px] animate-pulse">Syncing...</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-white/5 text-zinc-500 border-white/5 text-[8px]">Standby</Badge>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/5" />

                <div className="p-2 space-y-3">
                    {/* Auto Sync Rithmic */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white">Rithmic Auto-Sync</span>
                            <span className="text-[8px] text-zinc-500">Every {rithmicInterval} minutes</span>
                        </div>
                        <Switch
                            checked={rithmicAutoEnabled}
                            onCheckedChange={setRithmicAutoEnabled}
                            className="data-[state=checked]:bg-teal-500"
                        />
                    </div>

                    {/* Auto Sync Tradovate */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white">Tradovate Auto-Sync</span>
                            <span className="text-[8px] text-zinc-500">Every {tradovate.syncInterval} minutes</span>
                        </div>
                        <Switch
                            checked={tradovate.enableAutoSync}
                            onCheckedChange={tradovate.setEnableAutoSync}
                            className="data-[state=checked]:bg-teal-500"
                        />
                    </div>
                </div>

                <DropdownMenuSeparator className="bg-white/5" />

                <div className="p-2">
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Next Sync</span>
                        </div>
                        <span className="font-mono text-white">{nextSyncText}</span>
                    </div>

                    <button
                        onClick={handleGlobalSync}
                        disabled={isAnySyncing}
                        className="w-full h-8 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isAnySyncing && "animate-spin")} />
                        <span>Force Sync Now</span>
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
