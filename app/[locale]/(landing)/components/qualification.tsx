'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Qualification() {
  return (
    <section className="py-32 px-6 border-t border-border/50 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-2 bg-card/10 border border-border/60 p-2 rounded-sm overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-16 bg-card"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground mb-10 mono">Ideal Candidate</h3>
            <ul className="space-y-6">
              {[
                "Discretionary traders seeking institutional structure",
                "Prop firm applicants targeting 100% consistency",
                "Funded traders protecting existing capital edges",
                "Traders tired of self-deception and PnL noise"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-muted-foreground">
                  <span className="text-foreground mt-1">✓</span>
                  <span className="text-sm font-medium leading-relaxed tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-16 bg-card/95"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/70 mb-10 mono">Hard Refusals</h3>
            <ul className="space-y-6 opacity-80">
              {[
                "Signal seekers or copy-trading accounts",
                "Social traders chasing dopamine and clout",
                "Casual dabblers trading for excitement",
                "Motivation chasers seeking 'mindset' coaches"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-muted-foreground/80">
                  <span className="text-muted-foreground/60 mt-1">✕</span>
                  <span className="text-sm italic font-light leading-relaxed tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
