'use client'

import { motion } from 'framer-motion'
import { BarChart3, Brain, CalendarCheck2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'

const items = [
  {
    title: 'Real-time PnL Visibility',
    desc: 'Track performance instantly with chart context and account-level drilldowns.',
    icon: BarChart3,
  },
  {
    title: 'Unified Broker Ingestion',
    desc: 'Tradovate, Rithmic, IBKR, CSV and more in one normalized timeline.',
    icon: Database,
  },
  {
    title: 'AI Journal Insights',
    desc: 'Map emotions, execution quality, and recurring behavior loops automatically.',
    icon: Brain,
  },
  {
    title: 'Custom Dashboard Layouts',
    desc: 'Drag, resize, and organize widgets around your personal review workflow.',
    icon: LayoutDashboard,
  },
  {
    title: 'Structured Session Notes',
    desc: 'Preserve old trading journal notes and turn them into searchable intelligence.',
    icon: CalendarCheck2,
  },
  {
    title: 'Risk Guardrails',
    desc: 'Highlight deviations from plan and enforce compliance with clear prompts.',
    icon: ShieldCheck,
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Features</p>
          <h2 className="mt-2 text-[clamp(1.7rem,4.5vw,3rem)] font-semibold leading-[1.02] tracking-tight">
            Built for serious
            <span className="block text-[hsl(var(--brand-primary))]">trading journal workflows</span>
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
                <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--mk-text-muted))]">{item.desc}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
