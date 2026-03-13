import type { Metadata } from "next";
import { PricingPageClient } from "./pricing-page-client";

export const revalidate = 300;
const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/pricing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Pricing | Qunt Edge",
    description:
      "Compare Qunt Edge plans for individual traders and teams. Start free, then upgrade for AI debriefs and behavior analytics.",
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  };
}

export default function PricingPage() {
  return <PricingPageClient />;
}
