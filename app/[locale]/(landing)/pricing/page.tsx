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
    <div className="marketing-shell enterprise-grid">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <section className="enterprise-shell rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="enterprise-kicker">Enterprise Pricing</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("pricing.heading")}
            </h1>
            <p className="mt-4 text-base text-zinc-300 sm:text-lg">
              {t("pricing.subheading")}
            </p>
          </div>
          <div className="mt-10">
            <PricingPlans />
          </div>
        </section>
      </main>
    </div>
  );
}
