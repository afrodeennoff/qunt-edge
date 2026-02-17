"use client";

import { useEffect } from "react";
import PricingPlans from "@/components/pricing-plans";
import { useI18n } from "@/locales/client";
import { getReferralCode } from "@/lib/referral-storage";

export default function PricingPage() {
  const t = useI18n();
  // Store referral code from URL on mount
  useEffect(() => {
    getReferralCode();
  }, []);

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <h1 className="text-4xl font-bold text-center mb-4">
          {t("pricing.heading")}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          {t("pricing.subheading")}
        </p>

        <PricingPlans />
      </main>

    </div>
  );
}
