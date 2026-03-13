'use client'
import React, { useRef } from 'react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import Link from "next/link";
import { useCurrentLocale } from '@/locales/client';

interface HeroProps {
  onStart?: () => void;
}

export default function Hero({  }: HeroProps) {
  const ref = useRef(null);
  const locale = useCurrentLocale();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
    show: { 
      y: 0, 
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }
    },
  };

  return (
    <section ref={ref} className="relative isolate flex min-h-[90svh] md:min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl sm:max-w-6xl md:max-w-7xl h-[300px] sm:h-[400px] md:h-[600px] bg-[hsl(var(--foreground)/0.08)] blur-[80px] sm:blur-[100px] md:blur-[120px] rounded-full"></div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ scale }}
        className="max-w-7xl mx-auto relative z-10 w-full"
      >
        <motion.div variants={item} className="mb-6 sm:mb-8">
           <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-[hsl(var(--mk-border)/0.55)] bg-[hsl(var(--mk-surface)/0.72)] px-3 py-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse shadow-none"></span>
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-[hsl(var(--mk-text-muted))]">Institutional Intelligence Layer</span>
           </div>
        </motion.div>

        <motion.h1
          variants={item}
          className="mb-6 text-fluid-5xl sm:text-fluid-6xl md:text-fluid-7xl lg:text-fluid-8xl font-semibold leading-[0.86] tracking-[-0.038em] text-[hsl(var(--mk-text))] [font-family:var(--home-display)]"
        >
          Qunt <span className="bg-gradient-to-b from-[hsl(var(--mk-text))] to-[hsl(var(--mk-text)/0.55)] bg-clip-text text-transparent">Edge.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-responsive sm:text-responsive-lg md:text-xl lg:text-2xl text-[hsl(var(--mk-text-muted))] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-normal px-2"
        >
          Stop auditing the money. Audit the execution. <br className="hidden sm:block" />
          <span className="text-[hsl(var(--mk-text-muted))]">The clinical intelligence layer for professional discretionary traders.</span>
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
        >
          <Link
            href={`/${locale}/authentication?next=dashboard`}
            className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center rounded-full bg-primary px-8 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-all hover:opacity-90 sm:w-auto sm:text-xs"
          >
            Start Free Audit
          </Link>

          <Link
            href={`/${locale}/updates`}
            className="touch-target group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground sm:text-xs sm:tracking-[0.2em]"
          >
             View Product Updates
             <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-16 border-t border-border/30 px-4 pt-8 opacity-40 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0 sm:mt-20 sm:pt-10"
        >
           <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-20">
              <span className="text-sm font-black tracking-tighter text-foreground/50 sm:text-base md:text-xl">TRADOVATE</span>
              <span className="text-sm font-black tracking-tighter text-foreground/50 sm:text-base md:text-xl">RITHMIC</span>
              <span className="text-sm font-black tracking-tighter text-foreground/50 sm:text-base md:text-xl">IBKR</span>
              <span className="text-sm font-black tracking-tighter text-foreground/50 sm:text-base md:text-xl">CQG</span>
           </div>
        </motion.div>
      </motion.div>

      <div className="absolute top-0 left-4 h-full w-[1px] bg-gradient-to-b from-transparent via-border/60 to-transparent pointer-events-none sm:left-8 md:left-12"></div>
      <div className="absolute top-0 right-4 h-full w-[1px] bg-gradient-to-b from-transparent via-border/60 to-transparent pointer-events-none sm:right-8 md:right-12"></div>
    </section>
  );
}
