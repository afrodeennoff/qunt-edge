"use client"

import { DataProvider } from "@/context/data-provider";
import { SyncContextProvider } from "@/context/sync-context";
import { Toaster } from "@/components/ui/sonner";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <SyncContextProvider>
        <Toaster />
        {children}
      </SyncContextProvider>
    </DataProvider>
  );
}
