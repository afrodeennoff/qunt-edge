import { DashboardHeader } from "./components/dashboard-header";
import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";
import { DashboardProvider } from "./dashboard-context";
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
import Modals from "@/components/modals";
import { RithmicSyncNotifications } from "./components/import/rithmic/sync/rithmic-notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/authentication");
  }

  return (
    <DashboardProviders>
      <RithmicSyncNotifications />
      <Modals />
      <DashboardProvider>
        <div className="flex min-h-screen w-full bg-background selection:bg-accent-teal/30 selection:text-fg-primary">
          <DashboardSidebar />
          <SidebarInset className="flex-1 relative overflow-hidden">
            {/* Global Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-teal/5 blur-[120px] rounded-full animate-pulse-slow" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse-slow" />
              <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full animate-float" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
              <DashboardHeader />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </DashboardProvider>
    </DashboardProviders>
  );
}
