"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";

export function RootProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        const swEnabled = process.env.NEXT_PUBLIC_SW_ENABLED !== "false";
        const handleServiceWorker = () => {
            if (swEnabled) {
                navigator.serviceWorker.register("/sw.js").then(
                    () => undefined,
                    () => undefined
                );
                return;
            }

            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister();
                });
            });
        };

        if (document.readyState === "complete") {
            handleServiceWorker();
            return;
        }

        window.addEventListener("load", handleServiceWorker);
        return () => {
            window.removeEventListener("load", handleServiceWorker);
        };
    }, []);

    return (
        <TooltipProvider>
            <ThemeProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </ThemeProvider>
        </TooltipProvider>
    );
}
