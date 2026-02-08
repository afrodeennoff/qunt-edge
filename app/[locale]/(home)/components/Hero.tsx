'use client'

import React, { useRef } from 'react'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

const Hero: React.FC = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const item: Variants = {
    hidden: { y: 30, opacity: 0, filter: "blur(10px)" },
    show: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1], // refined ease-out-quart
      }
    },
  }

  return (
    <section ref={ref} className="relative pt-48 pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center items-center text-center">
      {/* Background Ambience */}
      <motion.div style={{ opacity, y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-teal-500/10 blur-[140px] rounded-full mix-blend-screen animate-pulse-slow"></div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-400/5 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full"
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ scale }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <motion.div variants={item} className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-white/5 rounded-full backdrop-blur-md hover:border-teal-500/20 transition-colors duration-500 group cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500 shadow-[0_0_8px_#2dd4bf]"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">Institutional Intelligence Layer</span>
          </div>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.85] text-white relative"
        >
          Qunt <span className="text-transparent bg-clip-text bg-gradient-to-b from-teal-400 to-teal-700 relative z-10">Edge.</span>
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-b from-teal-400 to-teal-700 text-transparent bg-clip-text select-none pointer-events-none" aria-hidden="true">
            Qunt Edge.
          </div>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
        >
          Your AI-Powered, Data-Driven Path to Profitable Trading. <br />
          <span className="text-zinc-500">Turn your trading data into a growth engine and eliminate costly habits.</span>
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            href="/authentication?next=dashboard"
            className="group relative w-full sm:w-auto overflow-hidden bg-white text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 hover:bg-teal-50 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
          >
            <span className="relative z-10">Start Free Audit</span>
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 w-full transform skew-x-12" />
          </Link>

          <button className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group px-4 py-2 rounded-full hover:bg-zinc-900/50">
            View Documentation
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-32 pt-12 border-t border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000"
        >
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {['TRADOVATE', 'RITHMIC', 'IBKR', 'CQG'].map((broker) => (
              <span key={broker} className="text-xl font-black tracking-tighter text-white/40 hover:text-white/80 transition-colors cursor-default">
                {broker}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative vertical lines */}
      <div className="absolute top-0 left-12 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-12 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>
    </section>
  )
}

export default Hero
