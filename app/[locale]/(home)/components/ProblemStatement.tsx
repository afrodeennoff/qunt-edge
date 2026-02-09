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
    <section id="problem" className="border-y border-border/70 bg-card/30 py-fluid-xl">
      <div className="container-fluid">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Core Problem</p>
            <h2 className="mt-3 text-fluid-3xl font-black leading-[0.95] tracking-tight sm:text-fluid-5xl">
              PnL Explains
              <br />
              <span className="text-muted-foreground">What Happened.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Sustainable performance comes from diagnosing decisions, not just counting outcomes. Qunt Edge shifts your review from
              money snapshots to execution intelligence.
            </p>

            <div className="mt-6 rounded-xl border border-primary/25 bg-primary/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Framework Shift</p>
              <p className="mt-1 text-sm text-foreground">Audit behavior first. Profit becomes a byproduct, not your compass.</p>
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
                  className="rounded-xl border border-border/70 bg-card/70 p-5"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
