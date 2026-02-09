import { motion } from 'framer-motion'

const fitList = [
  'Discretionary traders building repeatable routines',
  'Prop firm candidates optimizing consistency',
  'Funded traders protecting existing edge',
  'Team leads auditing process quality',
]

const noFitList = [
  'Signal-copy workflows with no journaling discipline',
  'Impulse-driven sessions without risk framework',
  'Vanity metric tracking with no review loop',
  'Users expecting alerts without process change',
]

export default function Qualification() {
  return (
    <section className="border-b border-border/70 bg-background py-fluid-xl">
      <div className="container-fluid">
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/25 bg-primary/10 p-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Best Fit</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">High-Discipline Traders</h3>
            <ul className="mt-4 space-y-3">
              {fitList.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-foreground">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/70 bg-card/70 p-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Not Ideal</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Noise-First Trading</h3>
            <ul className="mt-4 space-y-3">
              {noFitList.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-muted-foreground">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
