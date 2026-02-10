'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="relative px-4 pb-28 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="marketing-panel mx-auto max-w-4xl rounded-[30px] px-6 py-11 text-center sm:px-10"
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))]">Ready</p>
        <h2 className="mt-2 text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[0.98] tracking-tight [font-family:var(--font-poppins)]">
          Keep your old trading journal context.
          <span className="block text-[hsl(var(--brand-primary))]">Upgrade everything around it.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] sm:text-base">
          Same core information, modern interface precision.
        </p>
        <div className="mt-8">
          <Link
            href="/authentication?next=dashboard"
            className="inline-flex h-12 min-w-[230px] items-center justify-center rounded-full bg-[hsl(var(--brand-primary))] px-9 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ink))] transition-all duration-300 hover:bg-[hsl(var(--brand-primary-strong))]"
          >
            Access Dashboard
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
