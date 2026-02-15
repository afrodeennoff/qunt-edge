import { motion } from 'framer-motion'
import { AlertTriangle, Brain, Repeat } from 'lucide-react'

const problems = [
  {
    title: 'Outcome Bias',
    desc: 'Winning trades can hide broken decisions. The process decays before PnL reveals it.',
    icon: AlertTriangle,
  },
  {
    title: 'Emotional Drift',
    desc: 'Small frustration compounds into over-sizing, overtrading, and plan violations.',
    icon: Brain,
  },
  {
    title: 'No Feedback Loop',
    desc: 'Without structured review, you repeat noise instead of reinforcing edge.',
    icon: Repeat,
  },
]

export default function ProblemStatement() {
  return (
    <section id="problem" className="relative border-y border-[hsl(var(--mk-border)/0.25)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-7 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Core Problem</p>
            <h2 className="mt-3 text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold leading-[0.94] tracking-[-0.02em] [font-family:var(--home-display)]">
              PnL tells you
              <span className="block text-[hsl(var(--brand-primary))]">what happened, not why.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.75] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
              Most traders measure outcomes. Elite traders diagnose process quality. Qunt Edge shifts your review from
              isolated numbers to repeatable decision intelligence.
            </p>

            <div className="mt-6 rounded-2xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.08)] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]">Framework Shift</p>
              <p className="mt-1 text-sm text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
                Diagnose behavior first. Profit becomes a trailing result, not the steering wheel.
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
