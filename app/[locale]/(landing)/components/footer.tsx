'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, MessageCircle, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useI18n } from '@/locales/client'

type FooterLink = { name: string; href: string }
type SocialLink = FooterLink & { icon: ComponentType<{ className?: string }> }

const PRODUCT_LINKS: FooterLink[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Prop Firms', href: '/propfirms' },
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

  const socialLinks: SocialLink[] = [
    { name: 'GitHub', href: 'https://github.com/afrodeennoff/lassttry-edge-', icon: Github },
    { name: 'YouTube', href: 'https://www.youtube.com/@hugodemenez', icon: Youtube },
    { name: 'Discord', href: process.env.NEXT_PUBLIC_DISCORD_INVITATION || '', icon: MessageCircle },
  ].filter((item) => item.href)

  return (
    <footer aria-labelledby="footer-heading" className="relative mt-20 border-t border-border/60 bg-background">
      <h2 id="footer-heading" className="sr-only">{t('footer.heading')}</h2>

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-0 h-px w-[min(92%,1000px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute left-1/2 top-0 h-60 w-[min(80vw,700px)] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="container-fluid relative py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1.75fr] lg:gap-12">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                  <Logo className="h-5 w-5 fill-foreground" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-base font-black tracking-tight">Qunt Edge</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trading Intelligence</span>
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{t('footer.description')}</p>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/authentication" className="rounded-xl border border-border/70 px-4 py-2 text-[11px] font-semibold transition-colors hover:bg-muted/70">
                  Sign In
                </Link>
                <Link href="/support" className="rounded-xl bg-primary px-4 py-2 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  Contact Support
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                  >
                    <item.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
              <FooterColumn title="Product" links={PRODUCT_LINKS} />
              <FooterColumn title="Support" links={SUPPORT_LINKS} />
              <FooterColumn title="Legal" links={LEGAL_LINKS} />
            </div>
          </div>

          <div className="mt-9 border-t border-border/60 pt-5">
            <p className="text-xs text-muted-foreground">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/90">{t('disclaimer.risk.content')}</p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map((item) => (
          <li key={item.name}>
            <Link href={item.href} className="text-sm text-foreground/85 transition-colors hover:text-primary">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
