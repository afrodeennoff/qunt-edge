import Link from 'next/link'

const guideCards = [
  {
    title: 'Challenge Week Blueprint',
    summary: 'A day-by-day pacing template to avoid overtrading early while preserving room for high-quality setups.',
    steps: ['Set max daily loss before session open', 'Cap total position attempts per day', 'Journal only A-setup misses for review'],
  },
  {
    title: 'Drawdown Control Playbook',
    summary: 'Translate firm-level drawdown rules into concrete stop and size behavior that is executable in live conditions.',
    steps: ['Map account threshold into per-trade risk', 'Define hard stop triggers before volatility events', 'Cut size automatically after two red trades'],
  },
  {
    title: 'Payout Readiness Checklist',
    summary: 'Track consistency metrics that matter for funded-account durability before your first withdrawal cycle.',
    steps: ['Monitor average R and win-rate stability', 'Avoid strategy switching during payout week', 'Plan post-payout scaling with fixed risk ladder'],
  },
]

export function GuideLibrary() {
  return (
    <section className="mt-6 space-y-4">
      {guideCards.map((guide) => (
        <article key={guide.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">{guide.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {guide.steps.map((step) => (
              <li key={step} className="rounded-lg border border-border bg-background/50 px-3 py-2">
                {step}
              </li>
            ))}
          </ul>
        </article>
      ))}

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">Next best action</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          After picking a playbook, model your expected evaluation spend and break-even path in the calculator.
        </p>
        <Link
          href="/propfirmperk/calculator"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open Calculator
        </Link>
      </div>
    </section>
  )
}
