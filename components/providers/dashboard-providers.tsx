"use client"

import { DataProvider } from "@/context/data-provider";
import { DataStateProvider } from "@/context/providers/data-state-provider";
import { DataDerivedProvider } from "@/context/providers/data-derived-provider";
import { DataActionsProvider } from "@/context/providers/data-actions-provider";
import { SyncContextProvider } from "@/context/sync-context";
import { Toaster } from "@/components/ui/sonner";

function DashboardProvidersInner({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <DashboardProvidersInner>{children}</DashboardProvidersInner>
    </DataProvider>
  );
}
