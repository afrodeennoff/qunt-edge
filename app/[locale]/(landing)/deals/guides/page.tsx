import type { Metadata } from 'next'
import { PublicFlowShell } from '../_components/public-flow-shell'

import { GuideLibrary } from './components/guide-library'

export const metadata: Metadata = {
  title: 'Qunt Edge Playbooks',
  description: 'Execution-focused futures prop firm guides from Qunt Edge for challenge pacing, risk controls, and payout readiness.',
}

export default function PropfirmPerkGuidesPage() {
  return (
    <PublicFlowShell
      title="Playbooks"
      subtitle="Execution-focused futures prop firm guides from Qunt Edge for challenge pacing, risk controls, and payout readiness."
    >
      <section className="mt-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Prop firm playbooks for disciplined execution</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            These guides convert policy language into concrete actions you can execute during evaluation and funded phases.
            Keep the process simple, measurable, and repeatable.
          </p>
      </section>

      <GuideLibrary />
    </PublicFlowShell>
  )
}
