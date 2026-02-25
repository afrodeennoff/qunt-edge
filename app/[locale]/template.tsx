"use client"

import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { MotionPage } from "@/components/motion/motion-primitives"

export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionPage key={pathname}>{children}</MotionPage>
    </AnimatePresence>
  )
}

