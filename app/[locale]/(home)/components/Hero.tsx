"use client"

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, BarChart2, Activity, ArrowUpRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Hero() {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-center overflow-hidden px-4 pb-18 pt-34 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8 bg-background selection:bg-accent selection:text-white">

      {/* Background Grid */}
      <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C1F26_1px,transparent_1px),linear-gradient(to_bottom,#1C1F26_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute left-1/2 top-[-20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Column: Text */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="text-center lg:text-left">
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-mono text-muted-foreground backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            V2.0 SYSTEM ONLINE
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            Execution <br />
            <span className="text-accent">Intelligence.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-light">
            The professional terminal for discretionary traders. Unify your journals, analytics, and execution data in one production-grade interface.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/authentication?next=dashboard/terminal">
              <Button size="lg" className="h-12 px-8 rounded-full text-base font-medium">
                Launch Terminal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/journal">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base font-medium border-border bg-transparent hover:bg-card">
                View Demo Journal
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" />
              <span>API Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              <span>Institutional</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Visuals (Mock UI) */}
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
        >
            <div className="relative rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[4/3] transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mock Header */}
                <div className="h-10 border-b border-border bg-card flex items-center px-4 gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-success/50" />
                    <div className="ml-4 h-4 w-32 rounded-full bg-border/50" />
                </div>
                {/* Mock Chart Area */}
                <div className="p-6 h-full flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-sm font-mono text-muted-foreground">ES_FUT</div>
                            <div className="text-3xl font-bold font-mono">4,124.50</div>
                        </div>
                        <div className="text-success flex items-center gap-1 font-mono">
                            <ArrowUpRight className="h-4 w-4" /> +0.45%
                        </div>
                    </div>
                    {/* Abstract Chart Lines */}
                    <div className="flex-1 w-full bg-gradient-to-t from-accent/5 to-transparent rounded-lg border border-border/30 relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            <path d="M0,100 Q100,50 200,80 T400,20" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            <path d="M0,100 Q100,50 200,80 T400,20 V150 H0 Z" fill="url(#grad)" opacity="0.2" />
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(var(--accent))" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {/* Mock Widgets Row */}
                    <div className="grid grid-cols-3 gap-4 h-24">
                        <div className="rounded-lg bg-secondary/20 border border-border/50" />
                        <div className="rounded-lg bg-secondary/20 border border-border/50" />
                        <div className="rounded-lg bg-secondary/20 border border-border/50" />
                    </div>
                </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-4 shadow-xl flex items-center gap-4 animate-float">
                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-success" />
                </div>
                <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</div>
                    <div className="text-xl font-bold font-mono">68.4%</div>
                </div>
            </div>
        </motion.div>

      </div>
    </section>
  )
}
