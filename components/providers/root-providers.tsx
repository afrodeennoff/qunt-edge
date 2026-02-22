"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthTimeout } from "@/components/auth/auth-timeout";
import { useEffect } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { usePathname } from "next/navigation";

export function RootProviders({
    children,
    defaultOpen = true,
}: {
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    const pathname = usePathname();

    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        const swEnabled = process.env.NEXT_PUBLIC_SW_ENABLED === "true";
        const logPrefix = "[CacheDebug]";

        const unregisterAllServiceWorkers = async () => {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys
                    .filter((key) => key.startsWith("quntedge-static-"))
                    .map((key) => caches.delete(key))
            );
            console.info(`${logPrefix} service worker disabled; existing registrations cleared.`);
        };

        const registerServiceWorker = async () => {
            const registration = await navigator.serviceWorker.register("/sw.js");
            const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
            console.info(`${logPrefix} service worker registered`, {
                scope: registration.scope,
                pathname,
                navigationType: navigationEntry?.type ?? "unknown",
                hasController: Boolean(navigator.serviceWorker.controller),
            });
        };

        const handleLoad = () => {
            if (swEnabled) {
                registerServiceWorker().catch((error) => {
                    console.error(`${logPrefix} service worker registration failed`, error);
                });
                return;
            }

            unregisterAllServiceWorkers().catch((error) => {
                console.error(`${logPrefix} failed to clear service workers`, error);
            });
        };

        window.addEventListener("load", handleLoad);

        const handleControllerChange = () => {
            console.info(`${logPrefix} service worker controller changed`, {
                pathname,
                hasController: Boolean(navigator.serviceWorker.controller),
            });
        };
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

        return () => {
            window.removeEventListener("load", handleLoad);
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        };
    }, [pathname]);

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
