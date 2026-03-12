import { DashboardHeaderSkeleton, WidgetGridSkeleton, TableSkeleton, AccountsSkeleton, Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton({ activeTab }: { activeTab: string }) {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />
      {activeTab === "widgets" && <WidgetGridSkeleton />}
      {activeTab === "table" && <TableSkeleton />}
      {activeTab === "accounts" && <AccountsSkeleton />}
      {activeTab === "chart" && (
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}
    </div>
  )
}
