"use client"

import DashboardBehaviorClientPage from "./page-client"
import { UnifiedPageShell } from "@/components/layout/unified-page-shell"

export default function DashboardBehaviorPage() {
  return (
    <UnifiedPageShell density="compact">
      <DashboardBehaviorClientPage />
    </UnifiedPageShell>
  )
}
