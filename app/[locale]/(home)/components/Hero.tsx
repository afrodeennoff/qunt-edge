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
    <section ref={ref} className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8">
      <motion.div style={shouldAnimate ? { opacity } : undefined} className="pointer-events-none absolute inset-0">
        <div className={cn("absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]", isMobile && "bg-[size:34px_34px]")} />
        <div className={cn("absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[90px]", isMobile && "top-[-120px] h-[300px] w-[300px] blur-[64px]")} />
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
              Private Performance Intelligence
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mx-auto max-w-5xl text-center text-[clamp(2.45rem,10.2vw,7rem)] font-semibold leading-[0.92] tracking-[-0.03em] [font-family:var(--home-display)]"
          >
            Most traders log trades.
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Elite traders build systems.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-center text-[14px] leading-[1.72] text-muted-foreground sm:text-[18px] sm:leading-[1.8] [font-family:var(--home-copy)]">
            Qunt Edge exposes the decisions behind the numbers, so you stop performing for screenshots
            and start trading like a professional desk.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="h-12 w-full max-w-[320px] rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] shadow-lg shadow-primary/25 sm:min-w-[200px] sm:w-auto [font-family:var(--home-copy)]">
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Claim My Edge
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full max-w-[320px] rounded-full border-white/10 bg-white/5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm hover:bg-white/10 sm:min-w-[200px] sm:w-auto [font-family:var(--home-copy)]">
              <Link href={`/${locale}/#pricing`}>
                Compare Plans
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16">
            <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">AI Coaching Precision</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">91%</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Discipline Uplift</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-green-400 [font-family:var(--home-display)]">+34%</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Review Time Saved</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">-71%</p>
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
            No credit card required. Setup in under 10 minutes.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
