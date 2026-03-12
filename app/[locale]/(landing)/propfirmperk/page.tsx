import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicFlowShell } from './_components/public-flow-shell'

export const metadata: Metadata = {
  title: 'Qunt Edge Deals',
  description:
    'Monitor current funding-program offers and evaluate fit before committing capital.',
}

const deals = [
  {
    firm: 'Lucid Trading',
    offer: '50% off when you open any 2 evaluations',
    code: 'PERK',
    href: 'https://lucidtrading.com/ref/Tradebyadi/',
    note: 'Best for stacked evaluation entries this week.',
  },
  {
    firm: 'Take Profit Trader',
    offer: '40% off challenge fee with no activation surcharge',
    code: 'PERK',
    href: 'https://takeprofittrader.com/?referralCode=PERK',
    note: 'Lower upfront cost if you want a lean start.',
  },
  {
    firm: 'Apex Trader Funding',
    offer: 'Live promo feed and rolling discount windows',
    code: 'Track live',
    href: 'https://propfirmperk.com/compare',
    note: 'Good for traders timing reset cycles.',
  },
]

const nextSteps = [
  {
    title: 'Firm Matchup',
    description: 'Break down fee structure, drawdown style, and payout rules side by side.',
    href: '/propfirmperk/compare',
    cta: 'Open Matchup',
    internal: true,
  },
  {
    title: 'Cost Calculator',
    description: 'Model your expected spend and estimate break-even pace before you buy.',
    href: '/propfirmperk/calculator',
    cta: 'Run Cost Planner',
    internal: true,
  },
  {
    title: 'Execution Playbooks',
    description: 'Use practical playbooks for challenge pacing, risk limits, and consistency.',
    href: '/propfirmperk/guides',
    cta: 'Read Playbooks',
    internal: true,
  },
  {
    title: 'Deals FAQ',
    description: 'Get quick answers about the deals flow, updates, and how links are maintained.',
    href: '/propfirmperk/faq',
    cta: 'Visit FAQ',
    internal: true,
  },
]

export default function PropfirmPerkPage() {
  return (
    <PublicFlowShell
      title="Deals"
      subtitle="A Qunt Edge deal-first workspace for futures prop promotions. Start with current offers, then open matchup, planning, and policy resources as needed."
    >
      <div className="mt-5 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold uppercase tracking-[0.14em] text-foreground">Deal tape</p>
            <p>Refresh cadence: daily checks on listed offer terms</p>
          </div>
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-1 max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start with active offers, then validate fit before checkout
          </h2>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Every card keeps the signal tight: offer shape, code notes, and destination. The rest of the flow is one click away.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#deals-grid"
              className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              View Active Deals
            </a>
            <Link
              href="/propfirmperk/compare"
              className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Compare Firms
            </Link>
            <Link
              href="/propfirmperk/faq"
              className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Read Deals FAQ
            </Link>
          </div>
      </section>

      <section id="deals-grid" className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Offer Snapshot Cards</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fast scan format for code, offer shape, and where to redeem.
              </p>
            </div>
            <Link
              href="/propfirmperk/guides"
              className="inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-muted"
            >
              Open Playbooks
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <article key={deal.firm} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{deal.firm}</p>
                <p className="mt-3 text-base font-semibold text-foreground">{deal.offer}</p>
                <p className="mt-2 text-sm text-muted-foreground">{deal.note}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Code: <span className="font-semibold text-foreground">{deal.code}</span>
                </p>
                <a
                  href={deal.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open Deal
                </a>
              </article>
            ))}
          </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Need deeper due diligence?</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Use these focused jump points when you want full comparisons, planning tools, or policy answers.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {nextSteps.map((item) => (
              <article key={item.title} className="rounded-xl border border-border bg-background/50 p-5">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                {item.internal ? (
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-muted"
                  >
                    {item.cta}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-muted"
                  >
                    {item.cta}
                  </a>
                )}
              </article>
            ))}
          </div>
      </section>
    </PublicFlowShell>
  )
}
