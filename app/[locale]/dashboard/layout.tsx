import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";
import Navbar from "./components/navbar";
import { DashboardProvider } from "./dashboard-context";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
import dynamic from "next/dynamic";

const DashboardSidebar = dynamic(
  () => import("@/components/sidebar/dashboard-sidebar").then((module) => module.DashboardSidebar),
  {
    loading: () => <div className="hidden md:block w-14 lg:w-[72px]" />,
  }
);

const DashboardClientOverlays = dynamic(
  () => import("./components/dashboard-client-overlays").then((module) => module.DashboardClientOverlays)
);

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
      <DashboardClientOverlays />
      <DashboardProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden bg-background selection:bg-primary/20 selection:text-primary">
          <DashboardSidebar isAdmin={isAdmin} />
          <SidebarInset className="flex-1 min-h-0 relative overflow-hidden">
            {/* Global Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_42%,hsl(var(--background))_100%)] md:hidden" />
              <div className="absolute inset-0 hidden bg-[radial-gradient(1200px_800px_at_0%_-20%,hsl(var(--foreground) / 0.07),transparent_60%),radial-gradient(900px_600px_at_100%_0%,hsl(var(--foreground) / 0.045),transparent_58%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_45%,hsl(var(--background))_100%)] md:block" />
              <div className="hidden md:block dashboard-mesh-layer" />
              <div className="hidden md:block dashboard-texture-layer" />

              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60 mix-blend-screen">
                <div className="absolute -top-[20%] -left-[10%] h-[1000px] w-[1000px] animate-[pulse_12s_ease-in-out_infinite] rounded-full bg-primary/5 blur-[150px]" />
                <div className="absolute top-[30%] -right-[15%] h-[1200px] w-[1200px] animate-[pulse_18s_ease-in-out_infinite] rounded-full bg-white/[0.03] blur-[200px]" />
                <div className="absolute -bottom-[20%] left-[20%] h-[900px] w-[900px] animate-[pulse_15s_ease-in-out_infinite] rounded-full bg-white/[0.025] blur-[180px]" />
              </div>

              <div className="hidden md:block absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,hsl(var(--foreground) / 0.22),transparent)]" />
            </div>

            {/* Dashboard Content Container - Lower z-index to stay below Sidebar (z-30) */}
            <div className="relative z-0 flex h-svh min-h-0 flex-col">
              <Navbar />
              <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-safe">
                <div className="min-h-full">
                  {children}
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </DashboardProvider>
    </DashboardProviders>
  );
}
