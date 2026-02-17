"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthTimeout } from "@/components/auth/auth-timeout";
import { useEffect } from "react";
import { QueryProvider } from "@/components/providers/query-provider";

export function RootProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        const enableServiceWorker = process.env.NEXT_PUBLIC_ENABLE_SW === "true";
        const clearLegacyServiceWorker = async () => {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map((registration) => registration.unregister()));

                if ("caches" in window) {
                    const cacheKeys = await caches.keys();
                    await Promise.all(
                        cacheKeys
                            .filter((key) => key.startsWith("quntedge-static"))
                            .map((key) => caches.delete(key))
                    );
                }
            } catch (error) {
                console.warn("Failed clearing service worker/cache:", error);
            }
        };

        if (!enableServiceWorker) {
            void clearLegacyServiceWorker();
            return;
        }

        const register = () => {
            navigator.serviceWorker.register("/sw.js").then(
                (registration) => console.log("SW registered:", registration.scope),
                (err) => console.log("SW registration failed:", err)
            );
        };

        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
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
