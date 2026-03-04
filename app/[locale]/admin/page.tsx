import { Suspense } from 'react'
import { AdminDashboard } from '@/app/[locale]/admin/components/dashboard/admin-dashboard'

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading admin dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}
