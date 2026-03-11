"use client"

import { DataProvider } from "@/context/data-provider";
import { SyncContextProvider } from "@/context/sync-context";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldMountSyncProviders = pathname?.includes('/dashboard/import') ?? false;

  return (
    <DataProvider>
      {shouldMountSyncProviders ? (
        <SyncContextProvider>
          <Toaster />
          {children}
        </SyncContextProvider>
      ) : (
        <>
          <Toaster />
          {children}
        </>
      )}
    </DataProvider>
  );
}
