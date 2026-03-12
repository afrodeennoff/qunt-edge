'use client'

import { useMemo, useState } from 'react'

function toNumber(value: string, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function EvalCostCalculator() {
  const [evaluationFee, setEvaluationFee] = useState('149')
  const [expectedResets, setExpectedResets] = useState('1')
  const [resetCost, setResetCost] = useState('99')
  const [monthlyPlatformFees, setMonthlyPlatformFees] = useState('35')
  const [targetPayout, setTargetPayout] = useState('1200')

  const values = useMemo(() => {
    const fee = Math.max(0, toNumber(evaluationFee, 0))
    const resets = Math.max(0, toNumber(expectedResets, 0))
    const resetUnitCost = Math.max(0, toNumber(resetCost, 0))
    const platform = Math.max(0, toNumber(monthlyPlatformFees, 0))
    const payoutGoal = Math.max(0, toNumber(targetPayout, 0))

    const expectedTotalCost = fee + resets * resetUnitCost + platform
    const netTargetAfterCosts = Math.max(0, payoutGoal - expectedTotalCost)
    const minReturnNeeded = expectedTotalCost === 0 ? 0 : (expectedTotalCost / Math.max(payoutGoal, 1)) * 100

    return {
      expectedTotalCost,
      netTargetAfterCosts,
      minReturnNeeded,
    }
  }, [evaluationFee, expectedResets, resetCost, monthlyPlatformFees, targetPayout])

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground">Evaluation fee (USD)</span>
          <input
            value={evaluationFee}
            onChange={(event) => setEvaluationFee(event.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            placeholder="149"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground">Expected resets this month</span>
          <input
            value={expectedResets}
            onChange={(event) => setExpectedResets(event.target.value)}
            inputMode="numeric"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            placeholder="1"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground">Average reset cost (USD)</span>
          <input
            value={resetCost}
            onChange={(event) => setResetCost(event.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            placeholder="99"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground">Platform/data fees (USD)</span>
          <input
            value={monthlyPlatformFees}
            onChange={(event) => setMonthlyPlatformFees(event.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            placeholder="35"
          />
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-foreground">Target gross payout (USD)</span>
          <input
            value={targetPayout}
            onChange={(event) => setTargetPayout(event.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            placeholder="1200"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Expected Cost</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">${values.expectedTotalCost.toFixed(0)}</p>
        </article>
        <article className="rounded-xl border border-border bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Net After Costs</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">${values.netTargetAfterCosts.toFixed(0)}</p>
        </article>
        <article className="rounded-xl border border-border bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Cost-to-Payout Ratio</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{values.minReturnNeeded.toFixed(1)}%</p>
        </article>
      </div>
    </section>
  )
}
