"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronRight, FileText, Book, Code, Layout, Zap, Shield, Cpu, Database as DatabaseIcon } from "lucide-react"
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
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentGroup = docGroups.find(group =>
      group.items.some(item => item.href === pathname)
    )
    if (currentGroup) {
      setExpandedGroups(new Set([currentGroup.title]))
    }
  }, [pathname])

  const toggleGroup = (title: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedGroups(newExpanded)
  }

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
