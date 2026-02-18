"use client"

import { Mail, BarChart, UserPlus, Send } from "lucide-react"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { useCurrentLocale } from "@/locales/client"

export function SidebarNav() {
  const locale = useCurrentLocale()

  const routes: UnifiedSidebarItem[] = [
    {
      href: `/${locale}/admin/newsletter-builder`,
      label: "Newsletter Builder",
      icon: <Mail className="size-4" />,
    },
    {
      href: `/${locale}/admin/weekly-recap`,
      label: "Weekly Recap",
      icon: <BarChart className="size-4" />,
    },
    {
      href: `/${locale}/admin/welcome-email`,
      label: "Welcome Email",
      icon: <UserPlus className="size-4" />,
    },
    {
      href: `/${locale}/admin/send-email`,
      label: "Send Email",
      icon: <Send className="size-4" />,
    },
  ]

  return (
    <UnifiedSidebar
      items={routes}
    />
  )
}
