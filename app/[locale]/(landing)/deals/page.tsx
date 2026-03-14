import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicFlowShell } from './_components/public-flow-shell'
import { DealsMarketIllustration } from './_components/deals-market-illustration'
import { deals, faqItems, firms } from '../prop-firm-deals/data/mock-data'

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qunt-edge.vercel.app'
const PAGE_PATH = '/deals'
const TRUST_PILLARS = [
  'Editorial verification before listing',
  'Rule context attached to every deal',
  'One flow from scan to execution',
]

const DECISION_STEPS = [
  {
    title: 'Scan Active Offers',
    description: 'Start from current promotions, expiry windows, and fee context in one board.',
  },
  {
    title: 'Validate Rules',
    description: 'Cross-check drawdown model, payout cadence, and platform fit before checkout.',
  },
  {
    title: 'Execute With Confidence',
    description: 'Move directly into compare, planning, and playbooks without switching page context.',
  },
]

const VALUE_PATHS = [
  {
    title: 'Firm Matchup',
    description: 'Sort key rules side-by-side and isolate the right structure for your style.',
    href: '/deals/compare',
    cta: 'Open Matchup',
  },
  {
    title: 'Cost Planner',
    description: 'Estimate challenge spend and break-even path before opening multiple evaluations.',
    href: '/deals/calculator',
    cta: 'Run Planner',
  },
  {
    title: 'Execution Playbooks',
    description: 'Use practical tactics for passing evaluations without overextending risk.',
    href: '/deals/guides',
    cta: 'Read Playbooks',
  },
  {
    title: 'Support & FAQ',
    description: 'Get clarity on update cadence, disclosures, and verification standards.',
    href: '/deals/faq',
    cta: 'Open Help',
  },
]

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getFirmById(firmId: string) {
  return firms.find((firm) => firm.id === firmId)
}

function getCanonical(locale: string): string {
  const base = SITE_ORIGIN.replace(/\/+$/, '')
  return `${base}/${locale}${PAGE_PATH}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonical = getCanonical(locale)

  return {
    title: 'Qunt Edge Deals',
    description:
      'Compare verified funding-program deals, validate rule fit, and move from offer scan to execution in one page.',
    alternates: {
      canonical,
      languages: {
        'en-US': `${SITE_ORIGIN}/en${PAGE_PATH}`,
        'fr-FR': `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  }
}

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const featuredDeals = deals.slice(0, 6)
  const comparisonRows = firms.slice(0, 8)
  const topFaqs = faqItems.slice(0, 4)

  return (
    <PublicFlowShell
      title="Deals"
      subtitle="One decision surface for funding offers: scan promotions, compare rules, and choose your next move without splitting across multiple pages."
    >
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
              Deal tape
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Compare Prop Firm Deals In 60 Seconds
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Start with verified offers, inspect the actual rule profile, then route into your best next decision path.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#offers"
                className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Compare Deals
              </a>
              <Link
                href={`/${locale}/deals/compare`}
                className="inline-flex rounded-full border border-border bg-background/70 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Open Matchup
              </Link>
            </div>
          </div>
          <div className="h-[260px] rounded-2xl border border-border bg-background/60 p-3 sm:h-[320px]">
            <DealsMarketIllustration />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {DECISION_STEPS.map((step) => (
          <article key={step.title} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </article>
        ))}
      </section>

      <section id="offers" className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Offer Intelligence</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Promotion terms plus rule context in one card.
            </p>
          </div>
          <p className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {featuredDeals.length} active highlights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredDeals.map((deal) => {
            const firm = getFirmById(deal.firmId)
            return (
              <article
                key={deal.id}
                className="group rounded-2xl border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-20px_hsl(var(--brand-ink)/0.9)]"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {deal.firmName}
                </h3>
                <p className="mt-3 text-2xl font-black leading-tight text-foreground">{deal.discountPercent}% off</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Code: <span className="font-semibold text-foreground">{deal.couponCode}</span>
                </p>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <p>Challenge Fee: {formatMoney(deal.challengeFee)}</p>
                  <p>Drawdown: {deal.drawdownType}</p>
                  <p>Payout: {deal.payoutModel}</p>
                  <p>Platform: {deal.platform}</p>
                  {firm ? <p>Max Allocation: {firm.maxAllocation}</p> : null}
                </div>
                <a
                  href={deal.claimUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  aria-label={`Open ${deal.firmName} offer in a new tab`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open Offer
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Comparison Snapshot</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              High-signal structure comparison before detailed matcher review.
            </p>
          </div>
          <Link
            href={`/${locale}/deals/compare`}
            className="inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-foreground transition-colors hover:bg-muted"
          >
            Open Full Matchup
          </Link>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Prop firm comparison snapshot</caption>
            <thead className="bg-background/70">
              <tr className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-4 py-3">Firm</th>
                <th className="px-4 py-3">Challenge</th>
                <th className="px-4 py-3">Split</th>
                <th className="px-4 py-3">Drawdown</th>
                <th className="px-4 py-3">Payout</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((firm) => (
                <tr key={firm.id} className="border-t border-border text-sm">
                  <td className="px-4 py-3 font-semibold text-foreground">{firm.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatMoney(firm.challengeFee)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{firm.profitSplit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{firm.drawdownType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{firm.payoutFrequency}</td>
                  <td className="px-4 py-3 text-foreground">{firm.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          {comparisonRows.map((firm) => (
            <article key={firm.id} className="rounded-xl border border-border bg-background/60 p-4">
              <h3 className="text-base font-semibold text-foreground">{firm.name}</h3>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Challenge</dt>
                  <dd className="text-foreground">{formatMoney(firm.challengeFee)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Split</dt>
                  <dd className="text-foreground">{firm.profitSplit}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Drawdown</dt>
                  <dd className="text-foreground">{firm.drawdownType}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payout</dt>
                  <dd className="text-foreground">{firm.payoutFrequency}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Trust & Context</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TRUST_PILLARS.map((item) => (
            <article key={item} className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              {item}
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {topFaqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-border bg-background/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Comparison & Value Paths</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Continue based on your current decision stage.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {VALUE_PATHS.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-background/50 p-5">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <Link
                href={`/${locale}${item.href}`}
                className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-foreground transition-colors hover:bg-muted"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Final Checkpoint</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Pick the strongest fit, then execute in Qunt Edge
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Use the full matcher for deeper rule analysis or jump to cost planning if you are evaluating multiple accounts this week.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/deals/compare`}
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Matchup
          </Link>
          <Link
            href={`/${locale}/deals/calculator`}
            className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Open Cost Planner
          </Link>
        </div>
      </section>
    </PublicFlowShell>
  )
}
