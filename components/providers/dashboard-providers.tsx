"use client"

import { AccountsProvider } from "@/context/providers/accounts-provider";
import { DataProvider } from "@/context/data-provider";
import { FiltersProvider } from "@/context/providers/filters-provider";
import { SubscriptionProvider } from "@/context/providers/subscription-provider";
import { SyncContextProvider } from "@/context/sync-context";
import { TradesProvider } from "@/context/providers/trades-provider";
import { Toaster } from "@/components/ui/sonner";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <SubscriptionProvider>
        <FiltersProvider>
          <AccountsProvider>
            <TradesProvider>
              <SyncContextProvider>
                <Toaster />
                {children}
              </SyncContextProvider>
            </TradesProvider>
          </AccountsProvider>
        </FiltersProvider>
      </SubscriptionProvider>
    </DataProvider>
  );
}
