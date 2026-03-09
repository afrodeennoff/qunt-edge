import { getTraderById, getTraderVarSummary } from "../actions/user";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export async function TraderInfo({ slug }: { slug: string }) {
  const [traderInfoResponse, varSummaryResponse] = await Promise.all([
    getTraderById(slug),
    getTraderVarSummary(slug),
  ])

  const summary = varSummaryResponse.success ? varSummaryResponse.summary : undefined
  const insufficient = varSummaryResponse.error === "insufficientData"
  const failed = !varSummaryResponse.success && varSummaryResponse.error

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Trader Information</h2>
        <p>
          <strong>Email:</strong>{" "}
          {traderInfoResponse?.email
            ? traderInfoResponse.email
            : <span className="text-gray-500">No email</span>}
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">1-Day Value at Risk</h3>

        {summary ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/70 bg-card/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">Hist VaR 95%</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.hist95.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(summary.hist95.percent)}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">Hist VaR 99%</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.hist99.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(summary.hist99.percent)}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">Param VaR 95%</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.param95.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(summary.param95.percent)}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">Param VaR 99%</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.param99.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(summary.param99.percent)}</p>
            </div>
          </div>
        ) : null}

        {insufficient ? (
          <p className="text-sm text-muted-foreground">
            Not enough trade history to compute VaR (needs 30+ daily observations).
          </p>
        ) : null}

        {failed ? (
          <p className="text-sm text-destructive">
            Could not compute VaR right now. Please try again shortly.
          </p>
        ) : null}
      </div>
    </div>
  );
}
