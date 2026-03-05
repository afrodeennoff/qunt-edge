"use client";

import PricingPlans from "@/components/pricing-plans";
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";

export function PricingPageClient() {
  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-12 sm:py-16">
      <UnifiedSurface>
        <PricingPlans />
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
