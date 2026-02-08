'use client'

import React, { MouseEvent } from 'react'
import { motion, Variants, useMotionTemplate, useMotionValue } from 'framer-motion'
import { BarChart3, BellRing, Brain, CalendarCheck2, Database, LayoutDashboard, Users, Zap, Search, Shield, Globe } from 'lucide-react'

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-white/5 bg-[#0a0a0a] overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(45, 212, 191, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

const Features: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  }

  const features = [
    {
      title: "Real-time PnL",
      subtitle: "Advanced Analytics",
      desc: "Track your performance in real-time with customizable metrics. Visualize your equity curve and daily statistics instantly.",
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      title: "Multi-Broker Sync",
      subtitle: "Universal Integration",
      desc: "Connect Tradovate, Rithmic, IBKR, or import CSVs. Our AI-powered parser handles any broker format automatically.",
      icon: <Database className="w-5 h-5" />
    },
    {
      title: "AI Insights",
      subtitle: "Automated Journaling",
      desc: "Leverage AI for sentiment analysis, pattern recognition, and intelligent field mapping for seamless data imports.",
      icon: <Brain className="w-5 h-5" />
    },
    {
      title: "Interactive Dashboards",
      subtitle: "Custom Layouts",
      desc: "Drag-and-drop widget system allowing full control over your workspace. Create the perfect trading command center.",
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      title: "Internationalization",
      subtitle: "Global Support",
      desc: "Native support for multiple languages (EN/FR) and currencies. Locale-aware formatting for a truly global experience.",
      icon: <Globe className="w-5 h-5" />
    },
    {
      title: "Rich Journaling",
      subtitle: "Structured Data",
      desc: "Rich text editor with image resizing and table support. Document your edge with precision and clarity.",
      icon: <CalendarCheck2 className="w-5 h-5" />
    }
  ]

  return (
    <section id="features" className="py-32 px-6 bg-[#030303] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white"
            >
              Powerful Trading Infrastructure
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 max-w-xl text-lg font-light leading-relaxed"
            >
              Built with a modern stack (Next.js 15, React 19) for speed and reliability.
              <span className="block mt-2 text-zinc-500">Eliminate costly habits with data-driven precision.</span>
            </motion.p>
          </div>
          <div className="hidden md:block">
            <div className="flex gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest cursor-default">
              <span className="hover:text-teal-500 transition-colors">Stack: Next.js 15</span>
              <span>/</span>
              <span className="hover:text-teal-500 transition-colors">React 19</span>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
            >
              <SpotlightCard className="p-8 rounded-xl h-full">
                <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 mb-6 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-colors relative z-10">
                  {f.icon}
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-teal-500/70 transition-colors relative z-10">{f.subtitle}</h4>
                <h3 className="text-xl font-bold text-white tracking-tight mb-4 relative z-10">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-light group-hover:text-zinc-400 transition-colors relative z-10">{f.desc}</p>

                {/* Decorative subtle corner glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-2xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
