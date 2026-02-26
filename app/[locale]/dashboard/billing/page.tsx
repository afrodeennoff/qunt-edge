'use client'

import { Card, CardContent } from "@/components/ui/card"
import BillingManagement from './components/billing-management'
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function BillingPage() {
  return (
    <UnifiedPageShell density="compact">
      <UnifiedSurface>
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <BillingManagement />
          </CardContent>
        </Card>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
