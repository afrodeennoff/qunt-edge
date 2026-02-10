'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useCurrentLocale } from '@/locales/client'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Hero() {
  const locale = useCurrentLocale()
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <section ref={ref} className="relative overflow-hidden px-4 pb-18 pt-34 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8">
      <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
        <div className="marketing-grid absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[hsl(var(--brand-primary)/0.15)] blur-[90px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-7 flex justify-center">
            <div className="marketing-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />
              Institutional Intelligence Layer
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mx-auto max-w-5xl text-center text-[clamp(2.4rem,8vw,5.6rem)] font-semibold leading-[0.92] tracking-tight"
          >
            Stop auditing the money.
            <span className="block text-[hsl(var(--brand-primary))]">
              Audit the execution.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed text-[hsl(var(--mk-text-muted))] sm:text-[17px]">
            Qunt Edge is the clinical intelligence layer for professional discretionary traders. Track, journal, and improve
            consistency with one unified workflow.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/authentication?next=dashboard`}
              prefetch={false}
              className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-full bg-[hsl(var(--brand-primary))] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ink))] transition-all duration-300 hover:bg-[hsl(var(--brand-primary-strong))]"
            >
              Start Free Audit
            </Link>
            <Link
              href={`/${locale}/updates`}
              prefetch={false}
              className="inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-full border border-[hsl(var(--mk-border)/0.4)] bg-[hsl(var(--mk-surface)/0.7)] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--mk-text))] transition-all duration-300 hover:border-[hsl(var(--brand-primary)/0.55)]"
            >
              View Documentation
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 rounded-3xl border border-[hsl(var(--mk-border)/0.34)] bg-[hsl(var(--mk-surface)/0.72)] p-4 shadow-[0_26px_60px_-36px_hsl(var(--brand-ink)/0.7)] sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.7)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Win Rate</p>
                <p className="mt-2 text-2xl font-semibold">67.4%</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.7)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Behavior Score</p>
                <p className="mt-2 text-2xl font-semibold">8.9 / 10</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.7)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Risk Compliance</p>
                <p className="mt-2 text-2xl font-semibold text-[hsl(var(--brand-primary))]">Stable</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-11 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-medium tracking-[0.16em] text-[hsl(var(--mk-text-muted))]">
            <span>TRADOVATE</span>
            <span>RITHMIC</span>
            <span>IBKR</span>
            <span>CQG</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
