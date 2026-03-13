'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'

export default function TeamsPageClient() {
  const locale = useCurrentLocale()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-border bg-card/80 p-8 sm:p-10">
        <p className="inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Teams
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
          Manage your trading team from one control center
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Monitor trader performance, review analytics, and coordinate decisions across
          your desk with enterprise workflows built for prop firms and funds.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/teams/dashboard`}
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Open Team Dashboard
          </Link>
          <Link
            href={`/${locale}/support`}
            className="inline-flex items-center rounded-xl border border-border bg-background/70 px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Contact Sales
          </Link>
        </div>
      </section>
    </main>
  )
}
