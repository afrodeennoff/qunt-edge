import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardStrategiesPage() {
  return (
    <div className="mt-0 h-[calc(100dvh-112px)] px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-0 sm:px-4 sm:pb-4 sm:pt-0 lg:px-6 lg:pb-6 lg:pt-0">
      <div className="h-full w-full overflow-hidden">
        <TradeTableReview />
      </div>
    </div>
  )
}
