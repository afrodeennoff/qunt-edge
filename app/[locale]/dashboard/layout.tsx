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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const safeLocale = locale || "en";
    const nextPath = encodeURIComponent(`/${safeLocale}/dashboard`);
    redirect(`/${safeLocale}/authentication?next=${nextPath}`);
  }

  const isAdmin =
    user.id === process.env.ALLOWED_ADMIN_USER_ID ||
    user.id === process.env.ADMIN_USER_ID;

  return (
    <DashboardProviders>
      <RithmicSyncNotifications />
      <Modals />
      <DashboardProvider>
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary">
          <DashboardSidebar isAdmin={isAdmin} />
          <SidebarInset className="flex-1 min-h-0 relative overflow-hidden">
            {/* Global Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,#07070a_42%,#050505_100%)] md:hidden" />
              <div className="absolute inset-0 hidden bg-[radial-gradient(1200px_800px_at_0%_-20%,rgba(255,255,255,0.07),transparent_60%),radial-gradient(900px_600px_at_100%_0%,rgba(255,255,255,0.045),transparent_58%),linear-gradient(180deg,#050505_0%,#07070a_45%,#050505_100%)] md:block" />
              <div className="hidden md:block dashboard-mesh-layer" />
              <div className="hidden md:block dashboard-texture-layer" />
              <div className="hidden md:block absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)]" />
            </div>

            {/* Dashboard Content Container - Lower z-index to stay below Sidebar (z-30) */}
            <div className="relative z-0 flex h-svh min-h-0 flex-col">
              <DashboardHeader />
              <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-safe">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </DashboardProvider>
    </DashboardProviders>
  );
}
