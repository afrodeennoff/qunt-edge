'use client'

import Features from './Features'
import AnalysisDemo from './AnalysisDemo'
import HowItWorks from './HowItWorks'
import CTA from './CTA'

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
