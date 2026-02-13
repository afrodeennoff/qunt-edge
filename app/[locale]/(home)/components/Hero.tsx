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
              Home V2: Execution Intelligence Platform
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mx-auto max-w-5xl text-center text-[clamp(2.5rem,8.4vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.02em] [font-family:var(--font-poppins)]"
          >
            Grow the trader.
            <span className="block bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
              Not just the equity curve.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-center text-[15px] leading-relaxed text-[hsl(var(--mk-text-muted))] sm:text-[18px]">
            Qunt Edge V2 helps you understand why performance changes, what behavior caused it, and exactly what to fix next
            using auditable AI coaching and process-first analytics.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/authentication?next=dashboard`}
              className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-full bg-[hsl(var(--brand-primary))] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ink))] transition-all duration-300 hover:bg-[hsl(var(--brand-primary-strong))]"
            >
              Start Free Audit
            </Link>
            <Link
              href={`/${locale}/#pricing`}
              className="inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-full border border-[hsl(var(--mk-border)/0.4)] bg-[hsl(var(--mk-surface)/0.7)] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--mk-text))] transition-all duration-300 hover:border-[hsl(var(--brand-primary)/0.55)]"
            >
              See Pricing
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 rounded-3xl border border-[hsl(var(--mk-border)/0.34)] bg-[hsl(var(--mk-surface)/0.72)] p-4 shadow-[0_26px_60px_-36px_hsl(var(--brand-ink)/0.7)] sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.7)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">AI Coaching Precision</p>
                <p className="mt-2 text-2xl font-semibold">92%</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.7)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Plan Compliance Uplift</p>
                <p className="mt-2 text-2xl font-semibold">+31%</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.7)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Weekly Review Time</p>
                <p className="mt-2 text-2xl font-semibold text-[hsl(var(--brand-primary))]">-68%</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-11 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-medium tracking-[0.16em] text-[hsl(var(--mk-text-muted))]">
            <span>TRADOVATE</span>
            <span>RITHMIC</span>
            <span>IBKR</span>
            <span>CQG</span>
            <span>CSV IMPORT</span>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-center text-xs tracking-[0.08em] text-[hsl(var(--mk-text-muted))]">
            No credit card required. Setup in under 10 minutes.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
