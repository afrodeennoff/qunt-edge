import type { Metadata } from "next";
import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";
import { DashboardProvider } from "./dashboard-context";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
import { SidebarRootProviders } from "@/components/providers/root-providers";
import { DashboardScrollReset } from "./components/dashboard-scroll-reset";
import dynamic from "next/dynamic";

const DashboardSidebar = dynamic(
  () => import("@/components/sidebar/dashboard-sidebar").then((m) => m.DashboardSidebar),
  {
    loading: () => <div className="hidden md:block w-14 lg:w-[72px]" />,
  }
);

const DashboardHeader = dynamic(
  () => import("./components/dashboard-header").then((m) => m.DashboardHeader)
);

const DashboardClientOverlays = dynamic(
  () => import("./components/dashboard-client-overlays").then((m) => m.DashboardClientOverlays)
);

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
    <SidebarRootProviders withAuthTimeout>
      <DashboardProviders>
        <DashboardClientOverlays />
        <DashboardProvider>
          <DashboardScrollReset />
          <div className="flex min-h-screen w-full overflow-x-hidden bg-background selection:bg-primary/20 selection:text-primary">
            <DashboardSidebar isAdmin={isAdmin} />
            <SidebarInset className="flex-1 min-h-0 relative overflow-hidden">
              {/* Simplified Background - Performance Optimized */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
              </div>

              {/* Dashboard Content Container - Lower z-index to stay below Sidebar (z-30) */}
              <div className="relative z-0 flex h-svh min-h-0 flex-col">
                <DashboardHeader />
                <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-safe">
                  <div className="min-h-full">{children}</div>
                </main>
              </div>
            </SidebarInset>
          </div>
        </DashboardProvider>
      </DashboardProviders>
    </SidebarRootProviders>
  );
}
