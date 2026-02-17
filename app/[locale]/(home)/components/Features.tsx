'use client'

import { motion } from 'framer-motion'
import { BarChart3, Brain, CalendarCheck2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'

const items = [
  {
    title: 'Single Source Of Truth',
    desc: 'Executions, notes, screenshots, and context in one premium workspace.',
    icon: BarChart3,
  },
  {
    title: 'Rule-Based Scoring',
    desc: 'Every trade is scored against your standards, not your mood.',
    icon: Database,
  },
  {
    title: 'AI Debrief Engine',
    desc: 'High-signal post-session breakdowns with direct next-session priorities.',
    icon: Brain,
  },
  {
    title: 'Drift Detection',
    desc: 'Catch ego-driven drift before it compounds into drawdown.',
    icon: LayoutDashboard,
  },
  {
    title: 'Coaching Loop',
    desc: 'Convert weak patterns into enforceable interventions and measurable adherence.',
    icon: CalendarCheck2,
  },
  {
    title: 'Desk-Grade Visibility',
    desc: 'Mentors and managers see process quality with an auditable, shared lens.',
    icon: ShieldCheck,
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Capabilities</p>
          <h2 className="mt-2 text-[clamp(1.95rem,4.9vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.02em] [font-family:var(--home-display)]">
            Built for traders
            <span className="block text-[hsl(var(--brand-primary))]">who take standards personally</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.58, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="marketing-panel rounded-2xl p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-[hsl(var(--brand-primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.desc}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
