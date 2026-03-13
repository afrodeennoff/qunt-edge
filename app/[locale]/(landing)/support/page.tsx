import type { Metadata } from "next";
import SupportPageClient from "./page-client";

const SITE_ORIGIN = "https://quntedge.com";
const PAGE_PATH = "/support";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Support | Qunt Edge",
    description: "Get help with setup, billing, integrations, and trading performance workflows. Access documentation, FAQs, and contact our support team.",
    openGraph: {
      title: "Support | Qunt Edge",
      description: "Get help with setup, billing, integrations, and trading performance workflows. Access documentation, FAQs, and contact our support team.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Support | Qunt Edge",
      description: "Get help with setup, billing, integrations, and trading performance workflows. Access documentation, FAQs, and contact our support team.",
    },
    alternates: {
      canonical,
      languages: {
        'x-default': `${SITE_ORIGIN}/en${PAGE_PATH}`,
        'en': `${SITE_ORIGIN}/en${PAGE_PATH}`,
      },
    },
  };
}

export default function SupportPage() {
  return <SupportPageClient />;
}
