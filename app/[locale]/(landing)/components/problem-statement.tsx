'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function ProblemStatement() {
  return (
    <section id="problem" className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 bg-[hsl(var(--mk-bg-0))] border-t border-[hsl(var(--mk-border)/0.3)] relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="sticky top-20 lg:top-32"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-red-500/20 bg-red-500/5 mb-6 sm:mb-8">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-red-400">System Failure Detected</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 tracking-tighter leading-[0.95] text-[hsl(var(--mk-text))]">
            PnL is a <br/>
            <span className="text-[hsl(var(--brand-primary))]">Lagging Indicator.</span>
          </h2>
          <div className="space-y-6 sm:space-y-8 text-[hsl(var(--mk-text-muted))] text-base sm:text-lg leading-relaxed max-w-lg font-light">
            <p>
              Your bank account tells you <em>what</em> happened. It doesn't tell you <em>why</em>.
              Legacy journals are static graveyards of data that fail to capture the most critical variable in trading: <strong className="text-[hsl(var(--mk-text))] font-medium">State of Mind.</strong>
            </p>
            <p>
              Profit masks incompetence. You can violate every rule in your system, get lucky, and book a win. This reinforcement loop is the silent killer of careers.
            </p>
            <div className="pt-6 sm:pt-8 border-t border-[hsl(var(--mk-border)/0.3)] mt-8 sm:mt-10">
              <p className="text-[hsl(var(--brand-primary))] font-bold uppercase tracking-widest text-[10px] sm:text-xs mono mb-2">The Paradigm Shift</p>
              <p className="text-[hsl(var(--mk-text))] font-medium text-lg sm:text-xl tracking-tight">
                Stop auditing the money. Audit the execution.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:gap-6">
          {[
            {
              title: "Dopamine Addiction",
              desc: "The market is a random reinforcement machine. It rewards bad behavior just often enough to keep you hooked. We break the neural link between 'bad trade' and 'made money'.",
              code: "ERR_REWARD_MISMATCH"
            },
            {
              title: "Tilt Cascades",
              desc: "90% of account blowups happen in 10% of sessions. We identify the micro-fractures in your discipline—heavy breathing, revenge entries—before the dam breaks.",
              code: "ERR_EMOTIONAL_DRIFT"
            },
            {
              title: "Recency Bias",
              desc: "You trade based on your last 3 outcomes, not your 3-year edge. We force you to zoom out via hard data constraints, effectively acting as an algorithmic risk manager.",
              code: "ERR_SAMPLE_SIZE_LOW"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-1 rounded-xl bg-[hsl(var(--mk-surface)/0.5)] hover:bg-[hsl(var(--brand-primary)/0.08)] transition-all duration-500"
            >
              <div className="bg-[hsl(var(--mk-surface))] p-5 sm:p-6 md:p-8 rounded-lg h-full border border-[hsl(var(--mk-border)/0.3)] relative overflow-hidden group-hover:border-[hsl(var(--brand-primary)/0.2)] transition-colors">
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-[8px] sm:text-[9px] font-mono text-zinc-700 group-hover:text-red-400 transition-colors">
                      {item.code}
                  </div>
                  <div className="flex items-start gap-4 sm:gap-6">
                     <div className="text-[hsl(var(--mk-text-muted))] font-mono text-xl sm:text-2xl font-bold mt-1 group-hover:text-[hsl(var(--brand-primary))] transition-colors">0{i+1}</div>
                     <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 tracking-tight text-[hsl(var(--mk-text))] group-hover:text-[hsl(var(--mk-text))] transition-colors">{item.title}</h3>
                        <p className="text-[hsl(var(--mk-text-muted))] text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                     </div>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
