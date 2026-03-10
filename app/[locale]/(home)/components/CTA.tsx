'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'

export default function CTA() {
  const locale = useCurrentLocale()
  return (
    <section className="relative px-4 pb-28 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
      <div className="marketing-panel mx-auto max-w-4xl rounded-[30px] px-6 py-11 text-center sm:px-10">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Your Next Edge</p>
        <h2 className="mt-2 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.028em] [font-family:var(--home-display)]">
          Keep your strategy.
          <span className="block text-[hsl(var(--brand-primary))]">Raise the standard of your decisions.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.78] text-[hsl(var(--mk-text-muted))] sm:text-base [font-family:var(--home-copy)]">
          Join in minutes and receive your first AI-backed performance audit before your next session opens.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/${locale}/authentication?next=dashboard`}
            className="inline-flex h-12 min-w-[230px] items-center justify-center rounded-2xl bg-[hsl(var(--brand-primary))] px-9 text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-ink))] transition-all duration-300 hover:bg-[hsl(var(--brand-primary-strong))] [font-family:var(--home-copy)]"
          >
            Start My Performance Audit
          </Link>
          <p className="text-xs text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
