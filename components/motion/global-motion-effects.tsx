"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"

export function GlobalMotionEffects() {
  const prefersReducedMotion = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(true)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
  })
  const glowOpacity = useTransform(progress, [0, 0.3, 1], [0.2, 0.55, 0.25])

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const sync = () => setIsDesktop(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  if (prefersReducedMotion || !isDesktop) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120]">
      <motion.div className="h-[2px] origin-left bg-white/70 shadow-[0_0_18px_hsl(var(--foreground)/0.35)]" style={{ scaleX: progress }} />
      <motion.div className="h-px w-full bg-white/35" style={{ opacity: glowOpacity }} />
    </div>
  )
}
