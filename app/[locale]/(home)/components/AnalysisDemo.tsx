'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useIsMobile } from '@/hooks/use-mobile'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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

const AnalysisDemoChart = dynamic(() => import('./analysis-demo-chart'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface-muted)/0.65)]" />
  ),
})

export default function AnalysisDemo() {
  const [logIndex, setLogIndex] = useState(0)
  const isMobile = useIsMobile()
  const shouldAnimate = !isMobile

  useEffect(() => {
    if (isMobile) return

    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % logs.length)
    }, 1700)

    return () => clearInterval(timer)
  }, [isMobile])

  const activeLog = isMobile ? logs[0] : logs[logIndex]

  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Trading Journal Intelligence</p>
            <h2 className="mt-2 text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
              Real-time review for
              <span className="block text-[hsl(var(--brand-primary))]">process over outcome</span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-[1.78] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
            Old journal context stays intact while the interface mirrors a modern SaaS presentation style.
          </p>
        </div>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 22 } : false}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          viewport={shouldAnimate ? { once: true } : undefined}
          transition={shouldAnimate ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } : undefined}
          className="marketing-panel overflow-hidden rounded-[28px]"
        >
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border-b border-[hsl(var(--mk-border)/0.24)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Execution Stream</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">4,367.00</p>
                </div>
                <span className="rounded-full border border-[hsl(var(--brand-primary)/0.35)] bg-[hsl(var(--brand-primary)/0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-primary))] [font-family:var(--home-copy)]">
                  +1.27%
                </span>
              </div>

              {isMobile ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Plan Adherence</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">87%</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Risk Drift</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[hsl(var(--brand-primary))] [font-family:var(--home-display)]">-22%</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Review SLA</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">9m</p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] overflow-hidden rounded-2xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface-muted)/0.8)] p-3">
                  <AnalysisDemoChart data={mockData} />
                </div>
              )}
            </div>

            <div className="bg-[hsl(var(--mk-surface-muted)/0.42)] p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Journal Signals</p>
              <div className={cn("mt-4 space-y-3", isMobile ? "min-h-0" : "min-h-[220px]")}>
                <AnimatePresence mode="wait">
                  {shouldAnimate ? (
                    <motion.div
                      key={logIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.72)] p-4 text-sm leading-relaxed text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]"
                    >
                      {activeLog}
                    </motion.div>
                  ) : (
                    <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.72)] p-4 text-sm leading-relaxed text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]">
                      {activeLog}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-5 rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.72)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Anomaly Probability</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--mk-border)/0.22)]">
                  {shouldAnimate ? (
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '72%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-[hsl(var(--brand-primary))]"
                    />
                  ) : (
                    <div
                      style={{ width: '72%' }}
                      className="h-full rounded-full bg-[hsl(var(--brand-primary))]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
