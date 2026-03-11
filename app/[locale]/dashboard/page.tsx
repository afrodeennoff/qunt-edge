import { DashboardTabShell } from "./components/dashboard-tab-shell";

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

  return (
    <DashboardTabShell activeTab={activeTab} checkoutSuccess={checkoutSuccess} />
  );
}
