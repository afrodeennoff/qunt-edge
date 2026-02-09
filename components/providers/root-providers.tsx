"use client"

import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

export function RootProviders({ children }: { children: React.ReactNode }) {
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
