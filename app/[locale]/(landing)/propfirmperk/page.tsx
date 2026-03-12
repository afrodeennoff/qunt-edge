import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Deals - Qunt Edge',
  description: 'Compare futures prop firms, discover discounts, and access trading tools from one place.',
}

const futuresDeals = [
  {
    firm: 'Lucid Trading',
    offer: '50% Off (Any 2 Evaluations)',
    code: 'PERK',
    cta: 'https://lucidtrading.com/ref/Tradebyadi/',
  },
  {
    firm: 'Take Profit Trader',
    offer: '40% Off (No Activation)',
    code: 'PERK',
    cta: 'https://takeprofittrader.com/?referralCode=PERK',
  },
  {
    firm: 'Apex Trader Funding',
    offer: 'Latest Discount Tracking',
    code: 'PERK',
    cta: 'https://propfirmperk.com/compare',
  },
]

const toolFunctions = [
  {
    title: 'Compare Prop Firms',
    description: 'Challenge fees, drawdown rules, payout terms, and account model comparison.',
    href: 'https://propfirmperk.com/compare',
    ctaLabel: 'Open Compare',
  },
  {
    title: 'Discount Codes',
    description: 'Track active futures prop promotions and code-based savings opportunities.',
    href: 'https://propfirmperk.com',
    ctaLabel: 'View Deals',
  },
  {
    title: 'Calculator',
    description: 'Estimate challenge cost, total fee exposure, and payout break-even scenarios.',
    href: 'https://propfirmperk.com/calculator',
    ctaLabel: 'Open Calculator',
  },
  {
    title: 'Guides',
    description: 'Execution-focused guidance for evaluations, risk controls, and funded-account progression.',
    href: 'https://propfirmperk.com/guides',
    ctaLabel: 'Read Guides',
  },
  {
    title: 'FAQ',
    description: 'Find fast answers to common questions before selecting a futures prop program.',
    href: 'https://propfirmperk.com/faq',
    ctaLabel: 'Open FAQ',
  },
  {
    title: 'Main Website',
    description: 'Jump to the full Propfirm Perk platform and browse all currently available sections.',
    href: 'https://propfirmperk.com',
    ctaLabel: 'Visit Platform',
  },
]

export default function PropfirmPerkPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Futures Prop Hub
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Deals</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Fully aligned with your global theme, this page brings the key futures-focused functions into one place:
            compare firms, check discounts, use calculator tools, and open full guides.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://propfirmperk.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open PropfirmPerk.com
            </a>
            <a
              href="https://propfirmperk.com/compare"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Compare Futures Firms
            </a>
            <Link
              href="/dashboard?tab=accounts"
              className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Open Qunt Accounts
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">Core Functions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All primary Propfirm Perk-style functions for futures workflows.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {toolFunctions.map((tool) => (
              <article key={tool.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
                >
                  {tool.ctaLabel}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">Featured Futures Deals</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick access to active futures prop offers and code entry references.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {futuresDeals.map((deal) => (
              <article key={deal.firm} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {deal.firm}
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">{deal.offer}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use code: <span className="font-semibold text-foreground">{deal.code}</span>
                </p>
                <a
                  href={deal.cta}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open Deal
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
