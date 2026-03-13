import type { Metadata } from 'next'
import { PublicFlowShell } from '../_components/public-flow-shell'

import { GuideLibrary } from './components/guide-library'

const SITE_ORIGIN = 'https://qunt-edge.vercel.app'
const PAGE_PATH = '/deals/guides'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`

  return {
    title: 'Qunt Edge Playbooks',
    description: 'Execution-focused futures prop firm guides from Qunt Edge for challenge pacing, risk controls, and payout readiness.',
    alternates: {
      canonical,
      languages: {
        'en-US': `${SITE_ORIGIN}/en${PAGE_PATH}`,
        'fr-FR': `${SITE_ORIGIN}/fr${PAGE_PATH}`,
        'x-default': `${SITE_ORIGIN}/en${PAGE_PATH}`,
      },
    },
    openGraph: {
      title: 'Qunt Edge Playbooks',
      description: 'Execution-focused futures prop firm guides from Qunt Edge for challenge pacing, risk controls, and payout readiness.',
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Qunt Edge Playbooks',
      description: 'Execution-focused futures prop firm guides from Qunt Edge for challenge pacing, risk controls, and payout readiness.',
    },
  }
}

export default async function PropfirmPerkGuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  return (
    <PublicFlowShell
      title="Playbooks"
      subtitle="Execution-focused futures prop firm guides from Qunt Edge for challenge pacing, risk controls, and payout readiness."
    >
      <section className="mt-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Prop firm playbooks for disciplined execution</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            These guides convert policy language into concrete actions you can execute during evaluation and funded phases.
            Keep the process simple, measurable, and repeatable.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <article className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Focus</p>
              <p className="mt-1 font-semibold text-foreground">Execution Quality</p>
            </article>
            <article className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Mode</p>
              <p className="mt-1 font-semibold text-foreground">Actionable Steps</p>
            </article>
            <article className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Outcome</p>
              <p className="mt-1 font-semibold text-foreground">Lower Rule Breaches</p>
            </article>
          </div>
      </section>

      <GuideLibrary locale={locale} />
    </PublicFlowShell>
  )
}
