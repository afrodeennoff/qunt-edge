import type { Metadata } from 'next'
import { PublicFlowShell } from '../_components/public-flow-shell'

import { FirmComparisonGrid } from './components/firm-comparison-grid'

export const metadata: Metadata = {
  title: 'Qunt Edge Matchup',
  description: 'Compare futures prop firm structures with a Qunt Edge decision matrix built for practical challenge planning.',
}

export default function PropfirmPerkComparePage() {
  return (
    <PublicFlowShell
      title="Matchup"
      subtitle="Compare futures prop firm structures with a Qunt Edge decision matrix designed for practical challenge planning."
    >
      <section className="mt-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-1 max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Compare prop firm tradeoffs before you pay for an evaluation
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            This page is built for practical decision speed. Filter by your risk tolerance, payout timeline, and retry budget,
            then choose the structure that fits your trading process instead of chasing the biggest headline discount.
          </p>
      </section>

      <FirmComparisonGrid />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">1. Set your max first-month spend</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Include evaluation fee, likely reset probability, and platform add-ons. Budget discipline beats promo hype.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">2. Choose drawdown behavior you can execute</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A stricter threshold can still win if the rules match your intraday risk control habits.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">3. Align payout cadence to your cash plan</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Faster payout windows may matter less than consistency if your objective is stable account scaling.
            </p>
          </article>
      </section>
    </PublicFlowShell>
  )
}
