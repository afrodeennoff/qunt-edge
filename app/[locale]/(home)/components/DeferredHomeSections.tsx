"use client"

import dynamic from "next/dynamic"
import ProblemStatement from "./ProblemStatement"

function HomeSectionSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="relative min-h-[220px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl animate-pulse rounded-2xl border border-white/10 bg-white/5 p-8" />
    </section>
  )
}

const Features = dynamic(() => import("./Features"), {
  loading: () => <HomeSectionSkeleton />,
})
const HowItWorks = dynamic(() => import("./HowItWorks"), {
  loading: () => <HomeSectionSkeleton />,
})
const AnalysisDemo = dynamic(() => import("./AnalysisDemo"), {
  loading: () => <HomeSectionSkeleton />,
})
const WhyChooseUs = dynamic(() => import("./WhyChooseUs"), {
  loading: () => <HomeSectionSkeleton />,
})
const ComparisonSection = dynamic(() => import("./ComparisonSection"), {
  loading: () => <HomeSectionSkeleton />,
})
const AIFuturesSection = dynamic(() => import("./AIFuturesSection"), {
  loading: () => <HomeSectionSkeleton />,
})
const PricingSection = dynamic(() => import("./PricingSection"), {
  loading: () => <HomeSectionSkeleton />,
})
const CTA = dynamic(() => import("./CTA"), {
  loading: () => <HomeSectionSkeleton />,
})

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
