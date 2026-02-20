'use client'

import dynamic from 'next/dynamic'

const AnalysisDemo = dynamic(() => import('./AnalysisDemo'))
const ProblemStatement = dynamic(() => import('./ProblemStatement'))
const Features = dynamic(() => import('./Features'))
const HowItWorks = dynamic(() => import('./HowItWorks'))
const WhyChooseUs = dynamic(() => import('./WhyChooseUs'))
const ComparisonSection = dynamic(() => import('./ComparisonSection'))
const AIFuturesSection = dynamic(() => import('./AIFuturesSection'))
const PricingSection = dynamic(() => import('./PricingSection'))
const CTA = dynamic(() => import('./CTA'))

export default function DeferredHomeSections() {
  return (
    <>
      <ProblemStatement />
      <Features />
      <HowItWorks />
      <AnalysisDemo />
      <WhyChooseUs />
      <ComparisonSection />
      <AIFuturesSection />
      <PricingSection />
      <CTA />
    </>
  )
}
