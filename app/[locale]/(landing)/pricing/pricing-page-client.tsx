"use client";

import dynamic from "next/dynamic";
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";

const PricingPlans = dynamic(() => import("@/components/pricing-plans"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8">
      <div className="mb-6 h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-muted/70" />
        <div className="h-80 animate-pulse rounded-xl bg-muted/70" />
      </div>
    </div>
  ),
});

export function PricingPageClient() {
  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-12 sm:py-16">
      <UnifiedSurface>
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Qunt Edge Pricing</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Choose the plan that matches your trading cadence, review depth, and team workflow.
          </p>
        </header>
        <PricingPlans />
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
