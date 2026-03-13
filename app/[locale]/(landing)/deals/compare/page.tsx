import type { Metadata } from 'next'
import { PublicFlowShell } from '../_components/public-flow-shell'

import { FirmComparisonGrid } from './components/firm-comparison-grid'

const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/deals/compare";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: 'Qunt Edge Matchup',
    description: 'Compare futures prop firm structures with a Qunt Edge decision matrix built for practical challenge planning.',
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
        "x-default": `${SITE_ORIGIN}/en${PAGE_PATH}`,
      },
    },
    openGraph: {
      title: 'Qunt Edge Matchup',
      description: 'Compare futures prop firm structures with a Qunt Edge decision matrix built for practical challenge planning.',
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Qunt Edge Matchup',
      description: 'Compare futures prop firm structures with a Qunt Edge decision matrix built for practical challenge planning.',
    },
  };
}

export default function PropfirmPerkComparePage() {
  return (
    <PublicFlowShell
      title="Matchup"
      subtitle="Compare futures prop firm structures with a Qunt Edge decision matrix designed for practical challenge planning."
    >
      <section className="mt-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h2 className="mt-1 max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Compare prop firm tradeoffs before you pay for an evaluation
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Filter by drawdown model, reset behavior, and payout rhythm. Pick structure-fit over headline hype.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <article className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Firms</p>
              <p className="mt-1 text-lg font-bold text-foreground">24+</p>
            </article>
            <article className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Models</p>
              <p className="mt-1 text-lg font-bold text-foreground">3</p>
            </article>
            <article className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">View</p>
              <p className="mt-1 text-lg font-bold text-foreground">Live</p>
            </article>
          </div>
        </div>
      </section>

      <FirmComparisonGrid />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">1. Set max month-one spend</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Include evaluation fee, expected reset count, and platform costs.
          </p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">2. Pick executable drawdown</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Favor rule sets you can consistently follow during volatile sessions.
          </p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">3. Align payout cadence</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Match payout timing with your capital recycling and scaling plan.
          </p>
        </article>
      </section>
    </PublicFlowShell>
  )
}
