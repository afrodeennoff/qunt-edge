'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const FLOW_LINKS = [
  { path: '/deals', label: 'Deals' },
  { path: '/deals/compare', label: 'Matchup' },
  { path: '/deals/guides', label: 'Playbooks' },
  { path: '/deals/calculator', label: 'Cost Planner' },
  { path: '/deals/faq', label: 'Help' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/deals') {
    return pathname.endsWith('/deals') || pathname === '/deals'
  }
  return pathname.endsWith(href)
}

export function PublicFlowShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const pathname = usePathname()
  const locale = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i)?.[1] ?? 'en'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-6 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 right-24 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.09),transparent_48%,rgba(255,255,255,0.03))]" />
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <span className="rounded-full border border-border bg-background/80 px-2 py-1 text-foreground">
                Qunt Edge
              </span>
              <span>Futures Funding Offers Hub</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>

            <nav className="mt-6 flex flex-wrap gap-2" aria-label="Deals flow">
              {FLOW_LINKS.map((link) => (
                <Link
                  key={link.path}
                  href={`/${locale}${link.path}`}
                  className={cn(
                    'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
                    isActive(pathname, link.path)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background/60 text-foreground hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/70 p-4 text-xs text-muted-foreground sm:grid-cols-3 sm:p-5">
          <article className="rounded-xl border border-border bg-background/50 px-3 py-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-foreground">Offer Checks</p>
            <p className="mt-1">Deal terms re-validated before listing changes are published.</p>
          </article>
          <article className="rounded-xl border border-border bg-background/50 px-3 py-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-foreground">Policy Context</p>
            <p className="mt-1">Pricing, drawdown style, and payout notes linked in one flow.</p>
          </article>
          <article className="rounded-xl border border-border bg-background/50 px-3 py-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-foreground">Decision Tools</p>
            <p className="mt-1">Compare, plan costs, and verify rules before committing capital.</p>
          </article>
        </section>

        {children}
      </div>
    </div>
  )
}
