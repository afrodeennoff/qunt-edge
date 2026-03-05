'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), { ssr: false })
const ProblemStatement = dynamic(() => import('./ProblemStatement'), { ssr: false })
const Features = dynamic(() => import('./Features'), { ssr: false })
const HowItWorks = dynamic(() => import('./HowItWorks'), { ssr: false })
const WhyChooseUs = dynamic(() => import('./WhyChooseUs'), { ssr: false })
const ComparisonSection = dynamic(() => import('./ComparisonSection'), { ssr: false })
const AIFuturesSection = dynamic(() => import('./AIFuturesSection'), { ssr: false })
const PricingSection = dynamic(() => import('./PricingSection'), { ssr: false })
const CTA = dynamic(() => import('./CTA'), { ssr: false })

function LazySection({
  component: Component,
  eager = false,
}: {
  component: React.ComponentType
  eager?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shouldRender, setShouldRender] = useState(eager)

  useEffect(() => {
    if (shouldRender || !ref.current) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin: '420px 0px' }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [shouldRender])

  return <div ref={ref}>{shouldRender ? <Component /> : null}</div>
}

export default function DeferredHomeSections() {
  return (
    <>
      <LazySection component={ProblemStatement} />
      <LazySection component={Features} />
      <LazySection component={HowItWorks} />
      <LazySection component={AnalysisDemo} />
      <LazySection component={WhyChooseUs} />
      <LazySection component={ComparisonSection} />
      <LazySection component={AIFuturesSection} />
      <LazySection component={PricingSection} />
      <LazySection component={CTA} />
    </>
  )
}
