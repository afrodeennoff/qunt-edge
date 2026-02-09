'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const Features = dynamic(() => import('./Features'), { ssr: false })
const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), { ssr: false })
const HowItWorks = dynamic(() => import('./HowItWorks'), { ssr: false })
const CTA = dynamic(() => import('./CTA'), { ssr: false })

export default function DeferredHomeSections() {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || shouldRender) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setShouldRender(true)
        observer.disconnect()
      },
      { rootMargin: '500px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldRender])

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      {shouldRender ? (
        <>
          <AnalysisDemo />
          <Features />
          <HowItWorks />
          <CTA />
        </>
      ) : (
        <div className="py-24 sm:py-32" aria-hidden />
      )}
    </>
  )
}
