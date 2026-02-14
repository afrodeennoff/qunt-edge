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
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary">
          <DashboardSidebar />
          <SidebarInset className="flex-1 relative overflow-hidden">
            {/* Global Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,#07070a_42%,#050505_100%)] md:hidden" />
              <div className="absolute inset-0 hidden bg-[radial-gradient(1200px_800px_at_0%_-20%,rgba(255,255,255,0.07),transparent_60%),radial-gradient(900px_600px_at_100%_0%,rgba(255,255,255,0.045),transparent_58%),linear-gradient(180deg,#050505_0%,#07070a_45%,#050505_100%)] md:block" />
              <div className="hidden md:block dashboard-mesh-layer" />
              <div className="hidden md:block dashboard-texture-layer" />
              <div className="hidden md:block absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
              <DashboardHeader />
              <main className="flex-1 overflow-auto overscroll-y-contain pb-safe">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </DashboardProvider>
    </DashboardProviders>
  );
}
