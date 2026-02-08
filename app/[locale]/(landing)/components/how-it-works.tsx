'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { name: "Raw Ingestion", desc: "Zero manual input. We hook directly into your broker's API to pull raw execution logs." },
    { name: "Intent Locking", desc: "You define the setup before the session. If you take a trade outside these parameters, we flag it." },
    { name: "Clinical Audit", desc: "Our engine separates outcome (luck) from process (skill). Did you follow the plan?" },
    { name: "Loop Detection", desc: "AI identifies the exact moment your psychology shifted (e.g., after 2 consecutive losses)." },
    { name: "Forced Adaptation", desc: "The system locks you out or mandates size reduction until stability is restored." }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 bg-[#050505] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20 md:mb-24 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-3 sm:mb-4 text-white"
          >
            The Optimization Pipeline
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-lg mx-auto text-base sm:text-lg font-light px-4"
          >
            A closed-loop system designed to extract alpha from behavioral inefficiencies.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 relative">

          <div className="hidden lg:block absolute top-[28px] left-[10%] w-[80%] h-[2px] z-0">
             <div className="absolute inset-0 bg-zinc-900"></div>
             <motion.div
               initial={{ width: 0 }}
               whileInView={{ width: '100%' }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="h-full bg-gradient-to-r from-zinc-900 via-teal-500 to-zinc-900"
             />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group z-10"
            >
              <div className="flex justify-center mb-6 sm:mb-8 relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center relative z-10 group-hover:border-teal-500/50 transition-colors shadow-2xl">
                      <span className="text-zinc-500 font-mono text-xs sm:text-sm font-bold group-hover:text-teal-500">0{i+1}</span>
                  </div>
              </div>

              <div className="text-center px-2 sm:px-3">
                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4 text-white mono group-hover:text-teal-400 transition-colors">{step.name}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
