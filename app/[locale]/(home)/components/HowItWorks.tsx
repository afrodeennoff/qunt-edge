'use client'

import { motion } from 'framer-motion'

const steps = [
  { name: 'Ingest Data', text: 'Pull executions and session context from every source automatically.' },
  { name: 'Label Intent', text: 'Attach your planned setup and expected behavior before trading.' },
  { name: 'Audit Session', text: 'Compare plan versus execution to isolate process mistakes.' },
  { name: 'Detect Drift', text: 'Identify emotional and behavioral shifts as they start.' },
  { name: 'Improve Loop', text: 'Apply targeted changes and measure consistency over time.' },
]

export default function HowItWorks() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">How It Works</p>
          <h2 className="mt-2 text-[clamp(1.7rem,4.5vw,3rem)] font-semibold leading-[1.02] tracking-tight [font-family:var(--font-poppins)]">
            A clear process pipeline,
            <span className="block text-[hsl(var(--brand-primary))]">from raw data to better habits</span>
          </h2>
        </div>

        <div className="relative grid gap-4 md:grid-cols-5">
          {steps.map((step, i) => (
            <motion.article
              key={step.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="marketing-panel rounded-2xl p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-sm font-semibold text-[hsl(var(--brand-primary))]">
                0{i + 1}
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">{step.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--mk-text-muted))]">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
