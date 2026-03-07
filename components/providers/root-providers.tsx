"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { GlobalMotionEffects } from "@/components/motion/global-motion-effects";
import { AuthTimeout } from "@/components/auth/auth-timeout";

export function RootProviders({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        const swEnabled = process.env.NEXT_PUBLIC_SW_ENABLED === "true";
        const cacheDebugEnabled = process.env.NEXT_PUBLIC_CACHE_DEBUG === "true";
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
            if (cacheDebugEnabled) {
                console.info(`${logPrefix} service worker disabled; existing registrations cleared.`);
            }
        };

        const registerServiceWorker = async () => {
            const registration = await navigator.serviceWorker.register("/sw.js");
            const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
            if (cacheDebugEnabled) {
                console.info(`${logPrefix} service worker registered`, {
                    scope: registration.scope,
                    pathname: window.location.pathname,
                    navigationType: navigationEntry?.type ?? "unknown",
                    hasController: Boolean(navigator.serviceWorker.controller),
                });
            }
        };

        const handleLoad = () => {
            if (swEnabled) {
                registerServiceWorker().catch((error) => {
                    if (cacheDebugEnabled) {
                        console.error(`${logPrefix} service worker registration failed`, error);
                    }
                });
                return;
            }

            unregisterAllServiceWorkers().catch((error) => {
                if (cacheDebugEnabled) {
                    console.error(`${logPrefix} failed to clear service workers`, error);
                }
            });
        };

        window.addEventListener("load", handleLoad);

        const handleControllerChange = () => {
            if (cacheDebugEnabled) {
                console.info(`${logPrefix} service worker controller changed`, {
                    pathname: window.location.pathname,
                    hasController: Boolean(navigator.serviceWorker.controller),
                });
            }
        };
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

        return () => {
            window.removeEventListener("load", handleLoad);
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        };
    }, []);

    return (
        <QueryProvider>
            <TooltipProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </TooltipProvider>
        </QueryProvider>
    );
}

export function PublicRootProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RootProviders>
            <SmoothScrollProvider>
                <GlobalMotionEffects />
                {children}
            </SmoothScrollProvider>
        </RootProviders>
    );
}

export function SidebarRootProviders({
    children,
    defaultOpen = true,
    withAuthTimeout = false,
}: {
    children: React.ReactNode
    defaultOpen?: boolean
    withAuthTimeout?: boolean
}) {
    return (
        <RootProviders>
            <SidebarProvider defaultOpen={defaultOpen}>
                {withAuthTimeout ? <AuthTimeout /> : null}
                {children}
            </SidebarProvider>
        </RootProviders>
    );
}
