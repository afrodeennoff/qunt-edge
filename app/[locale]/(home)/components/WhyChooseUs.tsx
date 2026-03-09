'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock3, LineChart, ShieldCheck, Sparkles, Users2 } from 'lucide-react'

const proofStats = [
  { label: 'Time To First Diagnostic', value: '< 7 min', note: 'from first sync to actionable process signal' },
  { label: 'Drift Detection Speed', value: 'In Session', note: 'warnings before slippage becomes habit' },
  { label: 'Execution Coverage', value: '100%', note: 'every fill, note, and context event is tracked' },
]

const reasons = [
  {
    title: 'Decision Quality First',
    description: 'We prioritize rule quality and execution discipline before discussing outcome swings.',
    icon: ShieldCheck,
  },
  {
    title: 'Built For Competitors',
    description: 'Solo traders and desks run on one source of truth with role-specific visibility.',
    icon: Users2,
  },
  {
    title: 'Weekly Performance Momentum',
    description: 'AI reviews convert recurring mistakes into measurable, week-over-week progress.',
    icon: Clock3,
  },
  {
    title: 'Journal Intelligence',
    description: 'Structured notes and context become concrete intervention plans, not vague reminders.',
    icon: LineChart,
  },
]

const socialProof = [
  'Used by funded futures traders',
  'Adopted by performance coaches and trading desks',
  'Trusted for multi-account execution review',
]

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Badge variant="outline" className="border-[hsl(var(--brand-primary)/0.4)] bg-[hsl(var(--brand-primary)/0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]">
            Why Traders Choose Us
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Why high-standard traders
            <span className="block text-[hsl(var(--brand-primary))]">choose Qunt Edge over basic journals</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-[1.78] text-[hsl(var(--mk-text-muted))] sm:text-base [font-family:var(--home-copy)]">
            Qunt Edge merges execution analytics, journaling, and AI coaching into one weekly cadence so your process gets sharper, not noisier.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {proofStats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              className="marketing-panel rounded-2xl p-5"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">{stat.value}</p>
              <p className="mt-2 text-sm text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{stat.note}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card variant="glass" className="h-full rounded-2xl border-[hsl(var(--mk-border)/0.35)]">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.7)] text-[hsl(var(--brand-primary))]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl tracking-[-0.01em] [font-family:var(--home-display)]">{reason.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
                      {reason.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {socialProof.map((item, idx) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface)/0.7)] px-4 py-3 text-sm"
            >
              {idx === 0 && <Sparkles className="h-4 w-4 text-[hsl(var(--brand-primary))]" />}
              {idx === 1 && <CheckCircle2 className="h-4 w-4 text-[hsl(var(--brand-primary))]" />}
              {idx === 2 && <CheckCircle2 className="h-4 w-4 text-[hsl(var(--brand-primary))]" />}
              <span className="text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
