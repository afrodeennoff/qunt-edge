import dynamic from 'next/dynamic'
import ProblemStatement from './ProblemStatement'
import Features from './Features'

const SectionSkeleton = () => <div className="min-h-24 w-full" />

const HowItWorks = dynamic(() => import('./HowItWorks'), { loading: SectionSkeleton })
const AnalysisDemo = dynamic(() => import('./AnalysisDemo'), { loading: SectionSkeleton })
const WhyChooseUs = dynamic(() => import('./WhyChooseUs'), { loading: SectionSkeleton })
const ComparisonSection = dynamic(() => import('./ComparisonSection'), { loading: SectionSkeleton })
const AIFuturesSection = dynamic(() => import('./AIFuturesSection'), { loading: SectionSkeleton })
const PricingSection = dynamic(() => import('./PricingSection'), { loading: SectionSkeleton })
const CTA = dynamic(() => import('./CTA'), { loading: SectionSkeleton })

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
