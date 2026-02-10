'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

const mockData = [
  { time: '09:30', price: 4312, ema: 4308, volume: 32 },
  { time: '10:00', price: 4326, ema: 4313, volume: 45 },
  { time: '10:30', price: 4318, ema: 4315, volume: 38 },
  { time: '11:00', price: 4337, ema: 4320, volume: 58 },
  { time: '11:30', price: 4345, ema: 4328, volume: 62 },
  { time: '12:00', price: 4332, ema: 4330, volume: 41 },
  { time: '12:30', price: 4348, ema: 4334, volume: 54 },
  { time: '13:00', price: 4358, ema: 4341, volume: 59 },
  { time: '13:30', price: 4349, ema: 4344, volume: 43 },
  { time: '14:00', price: 4367, ema: 4350, volume: 67 },
]

const logs = [
  'Reviewing last 50 executions and journal entries.',
  'Detected consistency drift after two consecutive losses.',
  'Flagged oversized position relative to baseline.',
  'Suggested cooldown and reduced size profile.',
  'Session stabilized, plan compliance restored.',
]

export default function AnalysisDemo() {
  const [logIndex, setLogIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % logs.length)
    }, 1700)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Trading Journal Intelligence</p>
            <h2 className="mt-2 text-[clamp(1.7rem,4.5vw,3rem)] font-semibold leading-[1.02] tracking-tight">
              Real-time review for
              <span className="block text-[hsl(var(--brand-primary))]">process over outcome</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[hsl(var(--mk-text-muted))]">
            Old journal context stays intact while the interface mirrors a modern SaaS presentation style.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="marketing-panel overflow-hidden rounded-[28px]"
        >
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border-b border-[hsl(var(--mk-border)/0.24)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Execution Stream</p>
                  <p className="mt-1 text-2xl font-semibold">4,367.00</p>
                </div>
                <span className="rounded-full border border-[hsl(var(--brand-primary)/0.35)] bg-[hsl(var(--brand-primary)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-primary))]">
                  +1.27%
                </span>
              </div>

              <div className="h-[300px] overflow-hidden rounded-2xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface-muted)/0.8)] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockData}>
                    <defs>
                      <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--brand-primary))" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="hsl(var(--brand-primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(var(--mk-border)/0.22)" strokeDasharray="3 3" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--mk-text-muted))" />
                    <YAxis yAxisId="price" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--mk-text-muted))" />
                    <YAxis yAxisId="volume" hide />
                    <Tooltip
                      cursor={{ stroke: 'hsl(var(--mk-border)/0.45)' }}
                      contentStyle={{
                        background: 'hsl(var(--mk-surface))',
                        border: '1px solid hsl(var(--mk-border)/0.45)',
                        borderRadius: '10px',
                        color: 'hsl(var(--mk-text))',
                      }}
                    />
                    <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--brand-secondary))" opacity={0.16} barSize={8} />
                    <Area yAxisId="price" dataKey="price" stroke="none" fill="url(#chartArea)" />
                    <Line yAxisId="price" dataKey="price" dot={false} stroke="hsl(var(--brand-primary))" strokeWidth={2} />
                    <Line yAxisId="price" dataKey="ema" dot={false} stroke="hsl(var(--mk-text-muted))" strokeDasharray="6 4" strokeWidth={1.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[hsl(var(--mk-surface-muted)/0.42)] p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Journal Signals</p>
              <div className="mt-4 min-h-[220px] space-y-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={logIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.72)] p-4 text-sm leading-relaxed text-[hsl(var(--mk-text))]"
                  >
                    {logs[logIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-5 rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.72)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Anomaly Probability</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--mk-border)/0.22)]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '72%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-[hsl(var(--brand-primary))]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
