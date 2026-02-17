import { motion } from 'framer-motion'
import { AlertTriangle, Brain, Repeat } from 'lucide-react'

const problems = [
  {
    title: 'Vanity PnL',
    desc: 'A green day can still be bad trading. Sloppy decisions eventually collect interest.',
    icon: AlertTriangle,
  },
  {
    title: 'Emotional Leaks',
    desc: 'Tiny ego reactions become sizing mistakes, revenge entries, and broken risk.',
    icon: Brain,
  },
  {
    title: 'No Standard',
    desc: 'If performance is not measured against rules, improvement is just a story.',
    icon: Repeat,
  },
]

export default function ProblemStatement() {
  return (
    <section id="problem" className="relative border-y border-[hsl(var(--mk-border)/0.25)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-7 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Reality Check</p>
            <h2 className="mt-3 text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold leading-[0.94] tracking-[-0.02em] [font-family:var(--home-display)]">
              Amateurs track outcomes.
              <span className="block text-[hsl(var(--brand-primary))]">Professionals audit process.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.75] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
              You can keep guessing from PnL, or run your trading like a performance business.
              Qunt Edge gives you decision-level diagnostics, not motivational noise.
            </p>

            <div className="mt-6 rounded-2xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.08)] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]">The Shift</p>
              <p className="mt-1 text-sm text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
                Score behavior first. Profit becomes the receipt, not the strategy.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {problems.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface)/0.7)] p-5"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--brand-primary)/0.28)] bg-[hsl(var(--brand-primary)/0.08)] text-[hsl(var(--brand-primary))]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.desc}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
