'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale } from '@/locales/client'
import { useIsMobile } from '@/hooks/use-mobile'

type NavLink = { title: string; href: string }

const LINKS: NavLink[] = [
  { title: 'Features', href: '/#features' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Prop Firms', href: '/propfirms' },
  { title: 'Teams', href: '/teams' },
  { title: 'Support', href: '/support' },
]

export default function Navbar() {
  const pathname = usePathname()
  const locale = useCurrentLocale()
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={isMobile ? false : { opacity: 0, y: -18 }}
        animate={isMobile ? undefined : { opacity: 1, y: 0 }}
        transition={isMobile ? undefined : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1320px] px-4 pt-4 sm:px-6"
      >
        <motion.div
          className={cn(
            'flex h-[58px] items-center rounded-full border px-3 sm:h-[66px] sm:px-4',
            'border-[hsl(var(--mk-border)/0.4)] bg-[hsl(var(--mk-surface)/0.72)] backdrop-blur-md sm:backdrop-blur-xl',
            scrolled ? 'shadow-[0_20px_34px_-26px_hsl(var(--brand-ink)/0.82)] sm:shadow-[0_28px_48px_-32px_hsl(var(--brand-ink)/0.86)]' : 'shadow-[0_8px_24px_-20px_hsl(var(--brand-ink)/0.7)]'
          )}
          whileHover={isMobile ? undefined : { y: -1 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
        >
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface-muted)/0.85)]">
              <Logo className="h-4.5 w-4.5 fill-[hsl(var(--mk-text))]" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight [font-family:var(--font-poppins)] sm:inline-flex">Qunt Edge</span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <motion.div key={link.href} whileHover={isMobile ? undefined : { y: -1 }} transition={isMobile ? undefined : { duration: 0.2 }}>
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className={cn(
                    'rounded-full px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition-all duration-200',
                    isActive(link.href)
                      ? 'bg-[hsl(var(--brand-primary)/0.14)] text-[hsl(var(--mk-text))] shadow-[inset_0_0_0_1px_hsl(var(--mk-border)/0.45)]'
                      : 'text-[hsl(var(--mk-text-muted))] hover:bg-[hsl(var(--mk-surface-muted)/0.7)] hover:text-[hsl(var(--mk-text))]'
                  )}
                >
                  {link.title}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild className="hidden h-10 rounded-full bg-[hsl(var(--brand-primary))] px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ink))] shadow-[0_10px_24px_-14px_hsl(var(--brand-primary))] md:inline-flex">
              <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full text-[hsl(var(--mk-text))] lg:hidden">
                  <Menu className="h-4.5 w-4.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-[320px] border-l border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-bg-1))] p-0">
                <div className="flex h-full flex-col p-6">
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Primary site navigation and account access actions.
                  </SheetDescription>
                  <div className="space-y-2">
                    {LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={`/${locale}${link.href}`}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-[hsl(var(--mk-text))]"
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                  <Button asChild className="mt-auto h-11 rounded-full bg-[hsl(var(--brand-primary))] text-[hsl(var(--brand-ink))]">
                    <Link href={`/${locale}/authentication`} onClick={() => setMobileOpen(false)}>
                      Start Free Audit
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
