import AnalysisDemo from './AnalysisDemo'
import ProblemStatement from './ProblemStatement'
import Features from './Features'
import HowItWorks from './HowItWorks'
import WhyChooseUs from './WhyChooseUs'
import ComparisonSection from './ComparisonSection'
import AIFuturesSection from './AIFuturesSection'
import PricingSection from './PricingSection'
import CTA from './CTA'

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
