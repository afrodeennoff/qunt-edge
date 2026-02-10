'use client'

import dynamic from 'next/dynamic'

const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), {
  loading: () => <SectionFallback className="h-[420px]" />,
})

const Features = dynamic(() => import('./Features'), {
  loading: () => <SectionFallback className="h-[520px]" />,
})

const HowItWorks = dynamic(() => import('./HowItWorks'), {
  loading: () => <SectionFallback className="h-[460px]" />,
})

const CTA = dynamic(() => import('./CTA'), {
  loading: () => <SectionFallback className="h-[340px]" />,
})

export default function DeferredHomeSections() {
  return (
    <>
      <AnalysisDemo />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  )
}

function SectionFallback({ className }: { className: string }) {
  return (
    <div className={`mx-4 my-8 rounded-3xl border border-[hsl(var(--mk-border)/0.2)] bg-[hsl(var(--mk-surface)/0.45)] sm:mx-6 lg:mx-8 ${className}`} aria-hidden />
  )
}
