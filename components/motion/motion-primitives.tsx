"use client"

import { cn } from "@/lib/utils"
import { motion, useReducedMotion } from "framer-motion"

type MotionPrimitiveProps = {
  children: React.ReactNode
  className?: string
}

export function MotionPage({ children, className }: MotionPrimitiveProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function MotionSection({ children, className }: MotionPrimitiveProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

export function MotionStagger({ children, className }: MotionPrimitiveProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? undefined : "show"}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({ children, className }: MotionPrimitiveProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: prefersReducedMotion ? {} : { opacity: 0, y: 18, scale: 0.98 },
        show: prefersReducedMotion
          ? {}
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
            },
      }}
    >
      {children}
    </motion.div>
  )
}

