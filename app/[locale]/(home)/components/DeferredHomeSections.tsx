'use client'

import AnalysisDemo from './AnalysisDemo'
import WhyChooseUs from './WhyChooseUs'
import ComparisonSection from './ComparisonSection'
import AIFuturesSection from './AIFuturesSection'
import PricingSection from './PricingSection'
import CTA from './CTA'

export default function DeferredHomeSections() {
  return (
    <>
      <AnalysisDemo />
      <WhyChooseUs />
      <ComparisonSection />
      <AIFuturesSection />
      <PricingSection />
      <CTA />
    </>
  )
}
