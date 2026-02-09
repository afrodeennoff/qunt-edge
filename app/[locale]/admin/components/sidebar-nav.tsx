"use client"

import { Mail, BarChart, UserPlus, Send } from "lucide-react"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

export function SidebarNav() {
  const routes: UnifiedSidebarItem[] = [
    {
      href: "/admin/newsletter-builder",
      label: "Newsletter Builder",
      icon: <Mail className="size-4.5" />,
    },
    {
      href: "/admin/weekly-recap",
      label: "Weekly Recap",
      icon: <BarChart className="size-4.5" />,
    },
    {
      href: "/admin/welcome-email",
      label: "Welcome Email",
      icon: <UserPlus className="size-4.5" />,
    },
    {
      href: "/admin/send-email",
      label: "Send Email",
      icon: <Send className="size-4.5" />,
    },
  ]

  return (
    <UnifiedSidebar
      items={routes}
      styleVariant="minimal"
    />
  )
}
