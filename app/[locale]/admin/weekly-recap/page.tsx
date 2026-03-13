import type { Metadata } from "next";
import { WeeklyRecapProvider } from "../components/weekly-stats/weekly-recap-context";
import { WeeklyRecapPreview } from "../components/weekly-stats/weekly-recap-preview";

export const dynamic = "force-dynamic";
const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/admin/weekly-recap";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Weekly Recap | Qunt Edge Admin",
    description: "Preview and customize weekly recap emails for traders.",
    openGraph: {
      title: "Weekly Recap | Qunt Edge Admin",
      description: "Preview and customize weekly recap emails for traders.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Weekly Recap | Qunt Edge Admin",
      description: "Preview and customize weekly recap emails for traders.",
    },
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  };
}

export default function WeeklyRecapPage() {
  return (
    <WeeklyRecapProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Recap Preview</h1>
          <p className="text-muted-foreground">
            Preview and customize the weekly recap email that will be sent to traders.
          </p>
        </div>
      <WeeklyRecapPreview />
      </div>
    </WeeklyRecapProvider>
  );
}
