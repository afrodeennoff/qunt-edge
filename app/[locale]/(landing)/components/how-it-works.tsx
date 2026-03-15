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
    <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-3 sm:mb-4 text-foreground"
          >
            The Optimization Pipeline
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground/70 max-w-lg mx-auto text-base sm:text-lg font-light px-4"
          >
            A closed-loop system designed to extract alpha from behavioral inefficiencies.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 relative">

          <div className="hidden lg:block absolute top-[28px] left-[10%] w-[80%] h-[2px] z-0">
             <div className="absolute inset-0 bg-card/90"></div>
             <motion.div
               initial={{ width: 0 }}
               whileInView={{ width: '100%' }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="h-full bg-gradient-to-r from-card/90 via-card/60 to-card/90"
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-card border border-border/60 flex items-center justify-center relative z-10 group-hover:border-border/80 transition-colors shadow-2xl">
                      <span className="text-muted-foreground/70 font-mono text-xs sm:text-sm font-bold group-hover:text-foreground">0{i+1}</span>
                  </div>
              </div>

              <div className="text-center px-2 sm:px-3">
                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4 text-foreground mono group-hover:text-foreground transition-colors">{step.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed font-light">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
