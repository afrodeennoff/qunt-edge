'use client'

import { Card, CardContent } from "@/components/ui/card"
import BillingManagement from './components/billing-management'

export default function BillingPage() {
  return (
    <div className="relative flex w-full min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="flex w-full flex-1">
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
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
