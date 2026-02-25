'use client'

import { useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useCurrentLocale } from '@/locales/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Hero() {
  const locale = useCurrentLocale()
  const isMobile = useIsMobile()
  const shouldAnimate = !isMobile
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <section ref={ref} className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8">
      <motion.div style={shouldAnimate ? { opacity } : undefined} className="pointer-events-none absolute inset-0">
        <div className={cn("absolute inset-0 bg-grid-white/[0.02] bg-[size:48px_48px]", isMobile && "bg-[size:34px_34px]")} />
        <div className="absolute inset-x-8 top-6 h-px bg-white/10 sm:inset-x-12" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={shouldAnimate ? "hidden" : false}
          animate={shouldAnimate ? "show" : undefined}
          variants={shouldAnimate ? { show: { transition: { staggerChildren: 0.1 } } } : undefined}
        >
          <motion.div variants={fadeUp} className="mb-8 flex justify-center">
            <Badge variant="secondary" className="border-white/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              Built for serious discretionary traders
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mx-auto max-w-4xl text-center text-[clamp(2.55rem,10.2vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.032em] [font-family:var(--home-display)]"
          >
            Trade like the benchmark.
            <span className="mt-2 block text-[hsl(var(--brand-primary))]">
              Not like the crowd.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-center text-[14px] leading-[1.72] text-muted-foreground sm:text-[18px] sm:leading-[1.8] [font-family:var(--home-copy)]">
            Qunt Edge gives disciplined traders the one thing most platforms miss: a clear diagnosis of decision quality.
            See where your edge leaks, what behavior caused it, and what to correct before your next session.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="h-12 w-full max-w-[320px] rounded-2xl text-[10px] font-semibold uppercase tracking-[0.18em] shadow-lg shadow-primary/20 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Start My Performance Audit
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full max-w-[320px] rounded-2xl border-white/12 bg-black/40 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm hover:bg-black/60 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
              <Link href={`/${locale}/#pricing`}>
                Compare Plans
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16">
            <Card className="border-white/12 bg-black/45 shadow-xl backdrop-blur-md">
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Session Grade Confidence</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">94%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Rule Adherence Uplift</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-fg-primary [font-family:var(--home-display)]">+37%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Impulse Trades Reduced</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">-42%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
            <span>Tradovate</span>
            <span>Rithmic</span>
            <span>IBKR</span>
            <span>CQG</span>
            <span>CSV Import</span>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-center text-xs tracking-[0.08em] text-muted-foreground/60 [font-family:var(--home-copy)]">
            No credit card required. Be review-ready before your next open.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
