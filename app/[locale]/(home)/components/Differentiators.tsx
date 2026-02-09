import { motion } from 'framer-motion'
import { AlertCircle, Compass, ShieldCheck, Users } from 'lucide-react'

const differentiators = [
  {
    title: 'Behavior-First Metrics',
    desc: 'Execution discipline, rule adherence, and emotional variance are treated as first-class metrics.',
    icon: Compass,
  },
  {
    title: 'Decision Narrative',
    desc: 'Each session is reconstructed as a chain of decisions, not disconnected trades.',
    icon: AlertCircle,
  },
  {
    title: 'Structured Interventions',
    desc: 'When drift appears, Qunt Edge suggests concrete actions instead of generic motivation.',
    icon: ShieldCheck,
  },
  {
    title: 'Team Intelligence',
    desc: 'Managers can monitor process quality and role-level consistency across traders.',
    icon: Users,
  },
]

export default function Differentiators() {
  return (
    <section className="border-b border-border/70 bg-card/25 py-fluid-xl">
      <div className="container-fluid">
        <div className="mb-8 sm:mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Why Qunt Edge</p>
          <h2 className="mt-3 text-fluid-2xl font-black tracking-tight sm:text-fluid-4xl">
            Built For Traders Who
            <span className="text-muted-foreground"> Respect Process</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {differentiators.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
