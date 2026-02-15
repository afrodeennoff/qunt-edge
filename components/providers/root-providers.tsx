"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthTimeout } from "@/components/auth/auth-timeout";
import { useEffect } from "react";
import { QueryProvider } from "@/components/providers/query-provider";

export function RootProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("/sw.js").then(
                    () => undefined,
                    () => undefined
                );
            });
        }
    }, []);

    return (
        <QueryProvider>
            <TooltipProvider>
                <ThemeProvider>
                    <SidebarProvider>
                        <AuthTimeout />
                        {children}
                    </SidebarProvider>
                </ThemeProvider>
            </TooltipProvider>
        </QueryProvider>
    );
}
