"use client"

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"

export function GlobalMotionEffects() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
  })
  const glowOpacity = useTransform(progress, [0, 0.3, 1], [0.2, 0.55, 0.25])

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120]">
      <motion.div className="h-[2px] origin-left bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.35)]" style={{ scaleX: progress }} />
      <motion.div className="h-px w-full bg-white/35" style={{ opacity: glowOpacity }} />
    </div>
  )
}

