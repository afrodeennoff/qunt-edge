"use client"

import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Bug, X, RefreshCw, Database, HardDrive } from "lucide-react"
import { clearAllCache } from "@/lib/indexeddb/trades-cache"
import { cn } from "@/lib/utils"

export function DataDebug() {
    const { trades, formattedTrades, refreshAllData, isLoading } = useData()
    const { user, supabaseUser } = useUserStore(state => state)
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const handleClearCache = async () => {
        const userId = user?.id || supabaseUser?.id
        if (userId) {
            await clearAllCache(userId)
            window.location.reload()
        }
    }

    const isMock = trades.length > 0 && trades[0].id.startsWith('mock-')

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {!isOpen ? (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsOpen(true)}
                    className="rounded-full bg-black/80 border-white/10 hover:bg-white/10 backdrop-blur-md shadow-lg"
                >
                    <Bug className="h-4 w-4 text-primary" />
                </Button>
            ) : (
                <div className="w-80 bg-black/90 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Debug Dashboard</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 uppercase font-black tracking-tighter">Trades in Store</span>
                            <span className="text-white/90 font-mono">{trades.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 uppercase font-black tracking-tighter">Filtered Trades</span>
                            <span className="text-white/90 font-mono">{formattedTrades.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 uppercase font-black tracking-tighter">Accounts</span>
                            <span className="text-white/90 font-mono">{useData().accounts.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 uppercase font-black tracking-tighter">Environment</span>
                            <span className={cn("font-mono", process.env.NODE_ENV === 'development' ? "text-green-400" : "text-amber-400")}>
                                {process.env.NODE_ENV}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 uppercase font-black tracking-tighter">Data Logic</span>
                            <span className={cn("font-mono px-1.5 py-0.5 rounded text-[8px]", isMock ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500")}>
                                {isMock ? "MOCK (Fallback)" : "LIVE (Synced)"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 uppercase font-black tracking-tighter">User ID</span>
                            <span className="text-white/90 font-mono truncate max-w-[120px]">
                                {user?.id || supabaseUser?.id || "None"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshAllData({ force: true })}
                            disabled={isLoading}
                            className="h-8 text-[9px] font-bold uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10"
                        >
                            <RefreshCw className={cn("h-3 w-3 mr-2", isLoading && "animate-spin")} />
                            Sync Now
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearCache}
                            className="h-8 text-[9px] font-bold uppercase tracking-widest border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                        >
                            <HardDrive className="h-3 w-3 mr-2" />
                            Reset Cache
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
