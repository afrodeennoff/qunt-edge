'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const FLOW_LINKS = [
  { href: '/propfirmperk', label: 'Deals' },
  { href: '/propfirmperk/compare', label: 'Matchup' },
  { href: '/propfirmperk/guides', label: 'Playbooks' },
  { href: '/propfirmperk/calculator', label: 'Cost Planner' },
  { href: '/propfirmperk/faq', label: 'Help' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/propfirmperk') {
    return pathname.endsWith('/propfirmperk') || pathname === '/propfirmperk'
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="rounded-full border border-border bg-background px-2 py-1 text-foreground">
              Qunt Edge
            </span>
            <span>Futures Funding Offers Hub</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>

          <nav className="mt-5 flex flex-wrap gap-2" aria-label="Deals flow">
            {FLOW_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
                  isActive(pathname, link.href)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        {children}
      </div>
    </div>
  )
}
