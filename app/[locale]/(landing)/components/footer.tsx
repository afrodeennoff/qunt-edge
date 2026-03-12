'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, MessageCircle, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useI18n, useCurrentLocale } from '@/locales/client'

type FooterLink = { name: string; href: string }
type SocialLink = FooterLink & { icon: ComponentType<{ className?: string }> }

const PRODUCT_LINKS: FooterLink[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Prop Firms', href: '/propfirms' },
  { name: 'Deals', href: '/propfirmperk' },
  { name: 'Teams', href: '/teams' },
]

const SUPPORT_LINKS: FooterLink[] = [
  { name: 'Support', href: '/support' },
  { name: 'Community', href: '/community' },
  { name: 'Roadmap', href: '/updates' },
  { name: 'FAQ', href: '/faq' },
]

const LEGAL_LINKS: FooterLink[] = [
  { name: 'About', href: '/about' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'Disclaimers', href: '/disclaimers' },
]

export default function Footer() {
  const t = useI18n()
  const locale = useCurrentLocale()

  const socialLinks: SocialLink[] = [
    { name: 'GitHub', href: 'https://github.com/afrodeennoff/lassttry-edge-', icon: Github },
    { name: 'YouTube', href: 'https://www.youtube.com/@TIMON', icon: Youtube },
    { name: 'Discord', href: process.env.NEXT_PUBLIC_DISCORD_INVITATION || '', icon: MessageCircle },
  ].filter((item) => item.href)

  return (
    <footer aria-labelledby="footer-heading" className="relative mt-20 px-4 pb-12 sm:px-6 sm:pb-16">
      <h2 id="footer-heading" className="sr-only">{t('footer.heading')}</h2>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1240px] rounded-[30px] border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface)/0.74)] p-6 shadow-[0_28px_60px_-40px_hsl(var(--brand-ink)/0.8)] sm:p-8 lg:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--mk-border)/0.33)] bg-[hsl(var(--mk-surface-muted)/0.84)]">
                <Logo className="h-5 w-5 fill-[hsl(var(--mk-text))]" />
              </div>
              <div className="leading-none">
                <div className="text-base font-semibold tracking-tight">Qunt Edge</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Trading Intelligence</div>
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-[hsl(var(--mk-text-muted))]">{t('footer.description')}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/${locale}/authentication`} prefetch={false} className="rounded-full border border-[hsl(var(--mk-border)/0.35)] px-4 py-2 text-[11px] font-medium text-[hsl(var(--mk-text))] transition-all hover:border-[hsl(var(--brand-primary)/0.5)]">
                Sign In
              </Link>
              <Link href={`/${locale}/support`} prefetch={false} className="rounded-full bg-[hsl(var(--brand-primary))] px-4 py-2 text-[11px] font-medium text-[hsl(var(--brand-ink))] transition-all hover:bg-[hsl(var(--brand-primary-strong))]">
                Contact Support
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {socialLinks.map((item, idx) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--mk-border)/0.35)] text-[hsl(var(--mk-text-muted))] transition-all hover:border-[hsl(var(--brand-primary)/0.5)] hover:text-[hsl(var(--brand-primary))]"
                >
                  <item.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FooterColumn title="Product" links={PRODUCT_LINKS} />
            <FooterColumn title="Support" links={SUPPORT_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="mt-8 border-t border-[hsl(var(--mk-border)/0.28)] pt-5 text-[hsl(var(--mk-text-muted))]">
          <p className="text-xs">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="mt-2 text-[11px] leading-relaxed">{t('disclaimer.risk.content')}</p>
        </div>
      </motion.div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const locale = useCurrentLocale()
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map((item, idx) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
          >
            <Link href={`/${locale}${item.href}`} prefetch={false} className="text-sm text-[hsl(var(--mk-text))] transition-colors hover:text-[hsl(var(--brand-primary))]">
              {item.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
