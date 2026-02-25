"use client";

import { useEffect } from "react";
import PricingPlans from "@/components/pricing-plans";
import { useI18n } from "@/locales/client";
import { getReferralCode } from "@/lib/referral-storage";
import { UnifiedPageHeader, UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";

export default function PricingPage() {
  const t = useI18n();
  // Store referral code from URL on mount
  useEffect(() => {
    getReferralCode();
  }, []);

  return (
    <UnifiedPageShell className="py-12 sm:py-16">
      <UnifiedPageHeader
        eyebrow="Plans"
        title={t("pricing.heading")}
        description={t("pricing.subheading")}
      />
      <UnifiedSurface>
        <PricingPlans />
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
