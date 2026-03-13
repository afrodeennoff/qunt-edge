"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { GlobalMotionEffects } from "@/components/motion/global-motion-effects";
import { AuthTimeout } from "@/components/auth/auth-timeout";

const CHUNK_RECOVERY_SESSION_KEY = "chunk-reload-attempted";
const SERVICE_WORKER_CLEANUP_KEY = "sw-cleanup-v1";

function shouldRecoverFromChunkError(reason: unknown): boolean {
    const message =
        reason instanceof Error
            ? reason.message
            : typeof reason === "string"
                ? reason
                : "";

    if (!message) return false;

    return (
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Loading CSS chunk") ||
        message.includes("CSS chunk") ||
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Importing a module script failed") ||
        message.includes("ERR_MODULE_NOT_FOUND")
    );
}

export function RootProviders({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            return;
        }

        const recoverFromChunkError = (reason: unknown) => {
            if (!shouldRecoverFromChunkError(reason)) {
                return;
            }

            let alreadyAttempted = false;
            try {
                alreadyAttempted = sessionStorage.getItem(CHUNK_RECOVERY_SESSION_KEY) === "1";
            } catch {
                alreadyAttempted = false;
            }

            if (alreadyAttempted) {
                return;
            }

            try {
                sessionStorage.setItem(CHUNK_RECOVERY_SESSION_KEY, "1");
            } catch {
                // Ignore storage errors; still attempt reload once per page instance.
            }

            window.location.reload();
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            recoverFromChunkError(event.reason);
        };

        const handleWindowError = (event: ErrorEvent) => {
            recoverFromChunkError(event.error ?? event.message);
        };

        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        window.addEventListener("error", handleWindowError);

        return () => {
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
            window.removeEventListener("error", handleWindowError);
        };
    }, []);

    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        const cacheDebugEnabled = process.env.NEXT_PUBLIC_CACHE_DEBUG === "true";
        const shouldCleanupServiceWorkers = process.env.NEXT_PUBLIC_DISABLE_SERVICE_WORKERS === "true";
        const logPrefix = "[CacheDebug]";

        if (!shouldCleanupServiceWorkers) {
            return;
        }

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

        const handleLoad = () => {
            try {
                if (localStorage.getItem(SERVICE_WORKER_CLEANUP_KEY) === "1") {
                    return;
                }
            } catch {
                // Ignore storage errors and proceed once for this page load.
            }

            unregisterAllServiceWorkers().catch((error) => {
                if (cacheDebugEnabled) {
                    console.error(`${logPrefix} failed to clear service workers`, error);
                }
            });

            try {
                localStorage.setItem(SERVICE_WORKER_CLEANUP_KEY, "1");
            } catch {
                // Ignore storage errors.
            }
        };

        void handleLoad();

        if (document.readyState !== "complete") {
            window.addEventListener("load", handleLoad);
        }

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
        <TooltipProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </TooltipProvider>
    );
}

export function PublicRootProviders({
    children,
}: {
    children: React.ReactNode
}) {
    const enablePublicMotion = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_MOTION === "true";

    if (!enablePublicMotion) {
        return <RootProviders>{children}</RootProviders>;
    }

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
