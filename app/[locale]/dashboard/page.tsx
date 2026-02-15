import { DashboardTabShell } from "./components/dashboard-tab-shell";

type DashboardTab = "widgets" | "table" | "accounts" | "chart";

export const dynamic = "force-dynamic";

function sanitizeTab(tab?: string): DashboardTab {
  if (tab === "table" || tab === "accounts" || tab === "chart") {
    return tab;
  }
  return "widgets";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string }>;
}) {
  const params = await searchParams;
  const activeTab = sanitizeTab(params.tab);
  const checkoutSuccess = params.success === "true";

  return <DashboardTabShell activeTab={activeTab} checkoutSuccess={checkoutSuccess} />;
}
