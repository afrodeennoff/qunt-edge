"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthTimeout } from "@/components/auth/auth-timeout";

export function RootProviders({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <ThemeProvider>
                <SidebarProvider>
                    <AuthTimeout />
                    {children}
                </SidebarProvider>
            </ThemeProvider>
        </TooltipProvider>
    );
}
