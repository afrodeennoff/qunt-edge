"use client"

import { FileText, Book, Code, Layout, Zap, Shield, Cpu, Database as DatabaseIcon } from "lucide-react"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

interface DocGroup {
  title: string
  items: DocItem[]
}

interface DocItem {
  title: string
  href: string
  icon?: React.ReactNode
}

const docGroups: DocGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/introduction", icon: <FileText className="size-4.5" /> },
      { title: "Quick Start", href: "/docs/quick-start", icon: <Zap className="size-4.5" /> },
      { title: "Installation", href: "/docs/installation", icon: <Layout className="size-4.5" /> },
    ]
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Dashboard", href: "/docs/dashboard", icon: <Layout className="size-4.5" /> },
      { title: "Widgets", href: "/docs/widgets", icon: <Code className="size-4.5" /> },
      { title: "Data Management", href: "/docs/data-management", icon: <DatabaseIcon className="size-4.5" /> },
    ]
  },
  {
    title: "Features",
    items: [
      { title: "Trading Analysis", href: "/docs/trading-analysis", icon: <Book className="size-4.5" /> },
      { title: "Performance Tracking", href: "/docs/performance-tracking", icon: <FileText className="size-4.5" /> },
      { title: "Account Management", href: "/docs/account-management", icon: <Shield className="size-4.5" /> },
      { title: "Integration", href: "/docs/integration", icon: <Cpu className="size-4.5" /> },
    ]
  },
]

export function MdxSidebar() {
  const sidebarItems: UnifiedSidebarItem[] = docGroups.flatMap(group =>
    group.items.map(item => ({
      ...item,
      label: item.title,
      group: group.title,
      icon: item.icon || <FileText className="size-4.5" />
    }))
  )

  return (
    <UnifiedSidebar
      items={sidebarItems}
      showSubscription={false}
    />
  )
}
