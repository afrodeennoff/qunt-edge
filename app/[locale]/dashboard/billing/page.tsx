'use client'

import { Card, CardContent } from "@/components/ui/card"
import BillingManagement from './components/billing-management'
import { UnifiedPageHeader, UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function BillingPage() {
  return (
    <UnifiedPageShell className="py-4 sm:py-6">
      <UnifiedPageHeader
        eyebrow="Dashboard"
        title="Billing & Subscription"
        description="Manage your subscription plan, invoices, and payment methods."
      />
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
