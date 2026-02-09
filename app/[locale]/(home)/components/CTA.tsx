'use client'

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const CTA: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }
    },
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-6xl font-semibold tracking-tighter mb-8 text-white"
        >
          The market rewards <br />
          <span className="text-teal-500">process, not luck.</span>
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed font-normal"
        >
          Start identifying the behavioral leakages that are draining your account. Qunt Edge is the clinical intelligence layer for your trading career.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-6"
        >
          <Link
            href="/authentication?next=dashboard"
            className="group relative bg-teal-500 hover:bg-teal-400 text-black text-sm px-10 py-5 rounded-full font-bold uppercase tracking-widest transition-all hover:-translate-y-1 shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)] hover:shadow-[0_0_40px_-5px_rgba(45,212,191,0.5)] active:scale-95"
          >
            <span className="relative z-10">Apply for Early Access</span>
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0 w-full transform skew-x-12" />
          </Link>
          <p className="text-xs mono text-zinc-600">Limited availability to ensure quality support.</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTA;
