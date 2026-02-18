"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthTimeout } from "@/components/auth/auth-timeout";
import { useEffect } from "react";
import { QueryProvider } from "@/components/providers/query-provider";

export function RootProviders({
    children,
    defaultOpen = true,
}: {
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    useEffect(() => {
        if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("/sw.js").then(
                    (registration) => console.log("SW registered:", registration.scope),
                    (err) => console.log("SW registration failed:", err)
                );
            });
        }
    }, []);

    return (
        <QueryProvider>
            <TooltipProvider>
                <ThemeProvider>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <AuthTimeout />
                        {children}
                    </SidebarProvider>
                </ThemeProvider>
            </TooltipProvider>
        </QueryProvider>
    );
}
