import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicFlowShell } from './_components/public-flow-shell'
import { DealsMarketIllustration } from './_components/deals-market-illustration'

const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/deals";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: 'Qunt Edge Deals',
    description:
      'Monitor current funding-program offers and evaluate fit before committing capital.',
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  };
}

const deals = [
  {
    firm: 'Lucid Trading',
    offer: '50% off when you open any 2 evaluations',
    code: 'PERK',
    href: 'https://lucidtrading.com/ref/Tradebyadi/',
    note: 'Best for stacked evaluation entries this week.',
    updated: 'Checked today',
  },
  {
    firm: 'Take Profit Trader',
    offer: '40% off challenge fee with no activation surcharge',
    code: 'PERK',
    href: 'https://takeprofittrader.com/?referralCode=PERK',
    note: 'Lower upfront cost if you want a lean start.',
    updated: 'Checked today',
  },
  {
    firm: 'Apex Trader Funding',
    offer: 'Live promo feed and rolling discount windows',
    code: 'Track live',
    href: 'https://propfirmperk.com/compare',
    note: 'Good for traders timing reset cycles.',
    updated: 'Feed-driven',
  },
]

const trustSignals = ['Rule-checked terms', 'Fast compare flow', 'Qunt Edge workflow']

const kpiChips = [
  { label: 'Tracked Firms', value: '24+' },
  { label: 'Live Offers', value: '40+' },
  { label: 'Refresh Window', value: 'Daily' },
]

const howItWorks = [
  {
    title: 'Scan',
    description: 'Start with the strongest active promotions and identify relevant account structures.',
  },
  {
    title: 'Match',
    description: 'Open Matchup to align drawdown model, fee profile, and payout cadence.',
  },
  {
    title: 'Execute',
    description: 'Take the offer, then move directly into your Qunt Edge account workflow.',
  },
]

const nextSteps = [
  {
    title: 'Firm Matchup',
    description: 'Break down fee structure, drawdown style, and payout rules side by side.',
    href: '/deals/compare',
    cta: 'Open Matchup',
  },
  {
    title: 'Cost Planner',
    description: 'Model your expected spend and estimate break-even pace before you buy.',
    href: '/deals/calculator',
    cta: 'Run Cost Planner',
  },
  {
    title: 'Execution Playbooks',
    description: 'Use practical playbooks for challenge pacing, risk limits, and consistency.',
    href: '/deals/guides',
    cta: 'Read Playbooks',
  },
  {
    title: 'Deals Help',
    description: 'Get quick answers about the deals flow, updates, and validation process.',
    href: '/deals/faq',
    cta: 'Visit Help',
  },
]

function SignalIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M8 34 20 22l8 8 12-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="34" r="3" fill="currentColor" />
      <circle cx="20" cy="22" r="3" fill="currentColor" />
      <circle cx="28" cy="30" r="3" fill="currentColor" />
      <circle cx="40" cy="18" r="3" fill="currentColor" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M24 6 10 12v12c0 8 6 14 14 18 8-4 14-10 14-18V12L24 6Z" stroke="currentColor" strokeWidth="3" />
      <path d="m17 24 5 5 9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpeedIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M8 30a16 16 0 1 1 32 0" stroke="currentColor" strokeWidth="3" />
      <path d="M24 30 34 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="30" r="3" fill="currentColor" />
    </svg>
  )
}

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <PublicFlowShell
      title="Deals"
      subtitle="Compare prop firm deals in under a minute with verified rules, cost context, and direct next steps."
    >
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
              <SignalIcon />
              Deal tape
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Compare Prop Firm Deals In 60 Seconds
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Start with current offers, then validate structure and risk-fit before checkout.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#deals-grid"
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

            <div className="mt-5 flex flex-wrap gap-2">
              {trustSignals.map((signal) => (
                <span
                  key={signal}
                  className="inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl">
              {kpiChips.map((chip) => (
                <article key={chip.label} className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{chip.label}</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{chip.value}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="h-[260px] rounded-2xl border border-border bg-background/60 p-3 sm:h-[320px]">
            <DealsMarketIllustration />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="inline-flex text-primary"><ShieldIcon /></p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">1. Scan</h3>
          <p className="mt-2 text-sm text-muted-foreground">{howItWorks[0].description}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="inline-flex text-primary"><SignalIcon /></p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">2. Match</h3>
          <p className="mt-2 text-sm text-muted-foreground">{howItWorks[1].description}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="inline-flex text-primary"><SpeedIcon /></p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">3. Execute</h3>
          <p className="mt-2 text-sm text-muted-foreground">{howItWorks[2].description}</p>
        </article>
      </section>

      <section id="deals-grid" className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Live Offer Snapshots</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Code, structure, and destination in one scan.
            </p>
          </div>
          <Link
            href={`/${locale}/deals/guides`}
            className="inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-foreground transition-colors hover:bg-muted"
          >
            Open Playbooks
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <article
              key={deal.firm}
              className="group rounded-2xl border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-20px_hsl(var(--brand-ink)/0.9)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{deal.firm}</p>
                <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {deal.updated}
                </span>
              </div>
              <p className="mt-3 text-xl font-bold leading-tight text-foreground">{deal.offer}</p>
              <p className="mt-2 text-sm text-muted-foreground">{deal.note}</p>
              <p className="mt-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Code: {deal.code}
              </p>
              <a
                href={deal.href}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                aria-label={`Open ${deal.firm} deal in a new tab`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open {deal.firm} Deal
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Go deeper before checkout</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Use these focused paths for structure comparison, cost planning, playbooks, and support.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {nextSteps.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-background/50 p-5">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-foreground transition-colors hover:bg-muted"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Ready to compare structures?</p>
          <Link
            href={`/${locale}/deals/compare`}
            className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            Compare
          </Link>
        </div>
      </div>
    </PublicFlowShell>
  )
}
