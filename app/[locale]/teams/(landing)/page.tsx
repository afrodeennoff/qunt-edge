import type { Metadata } from "next";
import TeamsPageClient from "./page-client";

const SITE_ORIGIN = "https://quntedge.com";
const PAGE_PATH = "/teams";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Teams | Qunt Edge",
    description: "Manage trading teams with unified analytics, risk monitoring, and performance tracking. Perfect for prop firms and funds.",
    openGraph: {
      title: "Teams | Qunt Edge",
      description: "Manage trading teams with unified analytics, risk monitoring, and performance tracking. Perfect for prop firms and funds.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Teams | Qunt Edge",
      description: "Manage trading teams with unified analytics, risk monitoring, and performance tracking. Perfect for prop firms and funds.",
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

export default function TeamsPage() {
  return <TeamsPageClient />;
}
