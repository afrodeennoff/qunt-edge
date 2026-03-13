import type { Metadata } from 'next'
import { PublicFlowShell } from '../_components/public-flow-shell'

import { EvalCostCalculator } from './components/eval-cost-calculator'

export const metadata: Metadata = {
  title: 'Qunt Edge Cost Planner',
  description: 'Estimate prop firm evaluation economics with Qunt Edge so you can set realistic budget and payout expectations.',
}

export default function PropfirmPerkCalculatorPage() {
  return (
    <PublicFlowShell
      title="Cost Planner"
      subtitle="Estimate prop firm evaluation economics with Qunt Edge so you can set realistic budget and payout expectations."
    >
      <section className="mt-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Model your evaluation cost before you start</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Use this planning view to set realistic expectations for resets, platform costs, and payout targets.
            A clear budget framework protects your edge when challenge conditions get noisy.
          </p>
      </section>

      <EvalCostCalculator />

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Interpretation tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="rounded-lg border border-border bg-background/50 px-3 py-2">
              If your cost-to-payout ratio rises above 40%, reconsider account size, reset assumptions, or execution pace.
            </li>
            <li className="rounded-lg border border-border bg-background/50 px-3 py-2">
              Use the matchup page to cross-check whether a different drawdown model can reduce expected reset frequency.
            </li>
            <li className="rounded-lg border border-border bg-background/50 px-3 py-2">
              Pair this with the playbooks page to align risk rules with the same assumptions entered here.
            </li>
          </ul>
      </section>
    </PublicFlowShell>
  )
}
