import type { Metadata } from "next";
import SupportPageClient from "./page-client";

const SITE_ORIGIN = "https://qunt-edge.vercel.app";
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
    description: "Get help with setup, billing, integrations, and trading performance workflows.",
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  };
}

export default function SupportPage() {
  return <SupportPageClient />;
}
