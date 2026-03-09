"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Account, Group, normalizeAccountsForClient, normalizeGroupsForClient, AccountInput, GroupInput } from "@/lib/data-types";
import { getUserData } from "@/server/user-data";
import { createClient } from "@/lib/supabase";
import { getUserId } from "@/server/auth";
import { calculateAccountMetricsAction } from "@/server/accounts";
import { logger } from "@/lib/logger";

interface AccountsContextType {
  accounts: Account[];
  groups: Group[];
  isLoading: boolean;
  refreshAccounts: (force?: boolean) => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountsProvider");
  }
  return context;
}

export function AccountsProvider({ 
  children, 
  initialAccounts = [],
  initialGroups = []
}: { 
  children: React.ReactNode;
  initialAccounts?: Account[];
  initialGroups?: Group[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isLoading, setIsLoading] = useState(!initialAccounts.length);

  const refreshAccounts = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const data = await getUserData(force);
        if (data) {
          const normalizedAccounts = normalizeAccountsForClient(data.accounts as AccountInput[]);
          const accountsWithMetrics = await calculateAccountMetricsAction(normalizedAccounts);
          setAccounts(normalizeAccountsForClient(accountsWithMetrics));
          setGroups(normalizeGroupsForClient(data.groups as GroupInput[]));
        }
      }
    } catch (error) {
      logger.error({ error }, "Failed to refresh accounts");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialAccounts.length > 0) {
      setIsLoading(false);
      return;
    }
    
    refreshAccounts();
  }, []);

  const value = useMemo(() => ({
    accounts,
    groups,
    isLoading,
    refreshAccounts,
  }), [accounts, groups, isLoading, refreshAccounts]);

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}
