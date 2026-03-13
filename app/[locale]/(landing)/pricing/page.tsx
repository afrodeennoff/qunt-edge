import type { Metadata } from "next";
import { PricingPageClient } from "./pricing-page-client";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Pricing | Qunt Edge",
  description:
    "Compare Qunt Edge plans for individual traders and teams. Start free, then upgrade for AI debriefs and behavior analytics.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}
