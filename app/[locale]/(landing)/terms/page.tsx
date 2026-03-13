import type { Metadata } from "next";
import { TermsPageClient } from './terms-page-client';

export const revalidate = 3600;
const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/terms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Terms of Service | Qunt Edge",
    description:
      "Review Qunt Edge terms for subscriptions, data usage, service availability, and account responsibilities.",
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  };
}

export default function TermsPage() {
  return <TermsPageClient />;
}
