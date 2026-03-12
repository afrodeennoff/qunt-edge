"use client"

import { DataProvider } from "@/context/data-provider";
import { DataStateProvider } from "@/context/providers/data-state-provider";
import { DataDerivedProvider } from "@/context/providers/data-derived-provider";
import { DataActionsProvider } from "@/context/providers/data-actions-provider";
import { SyncContextProvider } from "@/context/sync-context";
import { Toaster } from "@/components/ui/sonner";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <DataStateProvider>
        <DataDerivedProvider>
          <DataActionsProvider>
            <SyncContextProvider>
              <Toaster />
              {children}
            </SyncContextProvider>
          </DataActionsProvider>
        </DataDerivedProvider>
      </DataStateProvider>
    </DataProvider>
  );
}
