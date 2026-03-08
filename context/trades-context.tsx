"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Trade, normalizeTradesForClient } from "@/lib/data-types";
import { Trade as PrismaTrade } from "@/prisma/generated/prisma";
import { SerializedTrade } from "@/server/trades";
import { getTradesAction } from "@/server/database";
import { createClient } from "@/lib/supabase";
import { getUserId } from "@/server/auth";
import { getTradesCache, setTradesCache } from "@/lib/indexeddb/trades-cache";
import { logger } from "@/lib/logger";

interface TradesContextType {
  trades: Trade[];
  isLoading: boolean;
  refreshTrades: (force?: boolean) => Promise<void>;
  totalTrades: number;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export function useTrades() {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error("useTrades must be used within TradesProvider");
  }
  return context;
}

export function TradesProvider({ 
  children, 
  initialTrades = [],
  initialStats = null
}: { 
  children: React.ReactNode;
  initialTrades?: Trade[];
  initialStats?: any;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [isLoading, setIsLoading] = useState(!initialTrades.length);
  const [totalTrades, setTotalTrades] = useState(0);

  const fetchTrades = useCallback(async (userId: string, force: boolean = false) => {
    try {
      const response = await getTradesAction(userId, 1, 500, force, true);
        const normalizedTrades = normalizeTradesForClient(response.trades as (PrismaTrade | SerializedTrade)[]);
        setTrades(normalizedTrades);
      setTotalTrades(response.metadata.total);
      return response.statistics;
    } catch (error) {
      logger.error({ error }, "Failed to fetch trades");
      return null;
    }
  }, []);

  const refreshTrades = useCallback(async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const userId = await getUserId();
        if (userId) {
          // Try cache first
          const cached = await getTradesCache(userId);
          if (cached && !force) {
            setTrades(cached as Trade[]);
          }
          
          // Fetch fresh
          await fetchTrades(userId, force);
          
          // Update cache
          const fresh = await getTradesAction(userId, 1, 500, false, false);
          const normalized = normalizeTradesForClient(fresh.trades as (PrismaTrade | SerializedTrade)[]);
          await setTradesCache(userId, normalized);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchTrades]);

  // Initial load
  useEffect(() => {
    if (initialTrades.length > 0) {
      setIsLoading(false);
      return;
    }
    
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const userId = await getUserId();
          if (userId) {
            await fetchTrades(userId, false);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [supabase, initialTrades.length, fetchTrades]);

  const value = useMemo(() => ({
    trades,
    isLoading,
    refreshTrades,
    totalTrades,
  }), [trades, isLoading, refreshTrades, totalTrades]);

  return (
    <TradesContext.Provider value={value}>
      {children}
    </TradesContext.Provider>
  );
}
