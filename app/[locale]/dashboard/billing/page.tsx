'use client'

import { Card, CardContent } from "@/components/ui/card"
import BillingManagement from './components/billing-management'

export default function BillingPage() {
  return (
    <div className="relative flex w-full flex-col min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="mb-8 rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6 w-full">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription plan, invoices, and payment methods.</p>
      </div>
      <div className="flex w-full flex-1">
        <div className="flex w-full flex-col lg:flex-row">
          <main className="w-full rounded-3xl border border-border/60 bg-card/75 py-6 shadow-sm backdrop-blur-sm lg:py-8">
            <div className="container mx-auto px-4 sm:px-6">
              <Card className="border-none bg-transparent shadow-none">
                <CardContent className="p-0">
                  <BillingManagement />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
