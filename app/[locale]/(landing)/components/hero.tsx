'use client'
import React, { useRef } from 'react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import Link from "next/link";

interface HeroProps {
  onStart?: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const ref = useRef(null);
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
    <section ref={ref} className="relative pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 overflow-hidden min-h-screen flex flex-col justify-center items-center text-center">
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl sm:max-w-6xl md:max-w-7xl h-[300px] sm:h-[400px] md:h-[600px] bg-teal-500/10 blur-[100px] sm:blur-[120px] md:blur-[140px] rounded-full"></div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ scale }}
        className="max-w-7xl mx-auto relative z-10 px-4"
      >
        <motion.div variants={item} className="mb-6 sm:mb-8">
           <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 bg-zinc-900/50 border border-white/5 rounded-full backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_#2dd4bf]"></span>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-zinc-400">Institutional Intelligence Layer</span>
           </div>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-fluid-5xl sm:text-fluid-6xl md:text-fluid-7xl lg:text-fluid-8xl font-bold tracking-tighter mb-6 sm:mb-8 leading-[0.9] sm:leading-[0.85] text-white"
        >
          Qunt <span className="text-transparent bg-clip-text bg-gradient-to-b from-teal-400 to-teal-700">Edge.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-responsive sm:text-responsive-lg md:text-xl lg:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light px-2"
        >
          Stop auditing the money. Audit the execution. <br className="hidden sm:block" />
          <span className="text-zinc-600">The clinical intelligence layer for professional discretionary traders.</span>
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
        >
          <Link
            href="/dashboard"
            className="touch-target group relative w-full sm:w-auto min-w-[200px] bg-white text-black px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all hover:bg-teal-400 hover:shadow-[0_0_40px_-10px_rgba(45,212,191,0.6)] text-center"
          >
            Apply for Access
          </Link>

          <Link
            href="/updates"
            className="touch-target text-zinc-500 hover:text-white transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-2 group"
          >
             View Documentation
             <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-16 sm:mt-24 md:mt-32 pt-8 sm:pt-12 border-t border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 px-4"
        >
           <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-20">
              <span className="text-sm sm:text-base md:text-xl font-black tracking-tighter text-white/50">TRADOVATE</span>
              <span className="text-sm sm:text-base md:text-xl font-black tracking-tighter text-white/50">RITHMIC</span>
              <span className="text-sm sm:text-base md:text-xl font-black tracking-tighter text-white/50">IBKR</span>
              <span className="text-sm sm:text-base md:text-xl font-black tracking-tighter text-white/50">CQG</span>
           </div>
        </motion.div>
      </motion.div>

      <div className="absolute top-0 left-4 sm:left-8 md:left-12 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-4 sm:right-8 md:right-12 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
    </section>
  );
}
