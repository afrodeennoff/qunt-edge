import { DashboardTabShell } from "./components/dashboard-tab-shell";
import { createClient } from "@/server/auth";
import { getUserId, getDatabaseUserId } from "@/server/auth";
import { getDashboardLayout } from "@/server/user-data";
import { getTradesAction } from "@/server/database";
import { normalizeTradesForClient, normalizeAccountsForClient, normalizeGroupsForClient, AccountInput, GroupInput } from "@/lib/data-types";
import { Trade as PrismaTrade } from "@/prisma/generated/prisma";
import { SerializedTrade } from "@/server/trades";
import { redirect } from "next/navigation";
import { getUserData } from "@/server/user-data";
import { calculateAccountMetricsAction } from "@/server/accounts";
import { defaultLayouts } from "@/lib/default-layouts";

export default async function DashboardPage(props: {
  searchParams: Promise<{ tab?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const rawTab = searchParams?.tab;
  const activeTab =
    rawTab === "table" ||
    rawTab === "accounts" ||
    rawTab === "chart" ||
    rawTab === "widgets"
      ? rawTab
      : "widgets";
  const checkoutSuccess = searchParams?.success === "true";

  // Server-side data fetching
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/en/authentication");
  }

  // Fetch trades with stats (first page, 500 trades, include stats)
  let initialTrades: any[] = [];
  let initialStats: any = null;
  let initialAccounts: any[] = [];
  let initialGroups: any[] = [];
  let dashboardLayout = defaultLayouts;

  try {
    const userId = await getUserId();
    
    if (userId) {
      // Fetch trades with pre-computed statistics
      const tradesResponse = await getTradesAction(userId, 1, 500, false, true);
      initialTrades = normalizeTradesForClient(tradesResponse.trades as (PrismaTrade | SerializedTrade)[]);
      initialStats = tradesResponse.statistics;

      // Fetch user data (accounts, groups)
      const userData = await getUserData(false);
      if (userData) {
        const normalizedAccounts = normalizeAccountsForClient(userData.accounts as AccountInput[]);
        const accountsWithMetrics = await calculateAccountMetricsAction(normalizedAccounts);
        initialAccounts = normalizeAccountsForClient(accountsWithMetrics);
        initialGroups = normalizeGroupsForClient(userData.groups as GroupInput[]);
      }

      // Fetch dashboard layout
      const layout = await getDashboardLayout(userId);
      if (layout) {
        dashboardLayout = layout as any;
      }
    }
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
  }

  return (
    <DashboardTabShell 
      activeTab={activeTab} 
      checkoutSuccess={checkoutSuccess}
      initialData={{
        trades: initialTrades,
        stats: initialStats,
        accounts: initialAccounts,
        groups: initialGroups,
        dashboardLayout,
      }}
    />
  );
}
