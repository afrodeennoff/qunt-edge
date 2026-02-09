'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Qualification() {
  return (
    <section className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-2 bg-white/5 border border-white/5 p-2 rounded-sm overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-16 bg-[#080808]"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-teal-500 mb-10 mono">Ideal Candidate</h3>
            <ul className="space-y-6">
              {[
                "Discretionary traders seeking institutional structure",
                "Prop firm applicants targeting 100% consistency",
                "Funded traders protecting existing capital edges",
                "Traders tired of self-deception and PnL noise"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-zinc-200">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span className="text-sm font-medium leading-relaxed tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-16 bg-black"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-10 mono">Hard Refusals</h3>
            <ul className="space-y-6 opacity-60">
              {[
                "Signal seekers or copy-trading accounts",
                "Social traders chasing dopamine and clout",
                "Casual dabblers trading for excitement",
                "Motivation chasers seeking 'mindset' coaches"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-zinc-400">
                  <span className="text-zinc-700 mt-1">✕</span>
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
