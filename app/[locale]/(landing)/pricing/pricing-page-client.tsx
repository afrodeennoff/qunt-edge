"use client";

import { useEffect } from "react";
import PricingPlans from "@/components/pricing-plans";
import { getReferralCode } from "@/lib/referral-storage";
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";

export function PricingPageClient() {
  useEffect(() => {
    getReferralCode();
  }, []);

  return (
    <UnifiedPageShell className="py-12 sm:py-16">
      <UnifiedSurface>
        <PricingPlans />
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
