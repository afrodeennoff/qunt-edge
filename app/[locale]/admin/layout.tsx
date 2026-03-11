'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AIModelSidebar } from "@/components/sidebar/aimodel-sidebar";
import { useCurrentLocale } from "@/locales/client";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RootProviders } from "@/components/providers/root-providers";
import { AuthTimeout } from "@/components/auth/auth-timeout";

export default function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {

  const {
    children
  } = props;

  const router = useRouter();
  const locale = useCurrentLocale();
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1)); // Remove the # and parse

    if (params.get('error')) {
      const errorDescription = params.get('error_description');
      toast.error("Authentication Error", {
        description: errorDescription?.replace(/\+/g, ' ') || "An error occurred during authentication",
      });

      // Clear the hash after showing the toast
      router.replace(`/${locale}/authentication`);
    }
  }, [locale, router]);

  return (
    <RootProviders>
      <SidebarProvider defaultOpen={true}>
        <AuthTimeout />
        <div className="flex min-h-screen w-full bg-background text-white">
          <AIModelSidebar />
          <SidebarInset className="flex-1 relative overflow-hidden bg-transparent">
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 bg-background/95 backdrop-blur-md">
              <div className="flex items-center gap-4 flex-shrink-0">
                <SidebarTrigger className="text-zinc-500 hover:text-white" />
                <h1 className="text-sm font-bold text-white tracking-wide uppercase whitespace-nowrap">Admin Panel</h1>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 relative z-0">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RootProviders>
  );
}
