import { DashboardTabShell } from "./components/dashboard-tab-shell";
import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/en/authentication");
  }

  return (
    <DashboardTabShell activeTab={activeTab} checkoutSuccess={checkoutSuccess} />
  );
}
