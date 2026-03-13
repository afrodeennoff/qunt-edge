import { DashboardTabShell } from "./components/dashboard-tab-shell";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Dashboard | Qunt Edge",
    description: "Access your trading analytics dashboard with real-time performance metrics, behavioral insights, and comprehensive trade analysis.",
    openGraph: {
      title: "Dashboard | Qunt Edge",
      description: "Access your trading analytics dashboard with real-time performance metrics, behavioral insights, and comprehensive trade analysis.",
      url: `https://quntedge.com/${locale}/dashboard`,
      siteName: "Qunt Edge",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Dashboard | Qunt Edge",
      description: "Access your trading analytics dashboard with real-time performance metrics, behavioral insights, and comprehensive trade analysis.",
    },
    alternates: {
      canonical: `./${locale}/dashboard`,
      languages: {
        'x-default': `./en/dashboard`,
        'en': `./en/dashboard`,
      },
    },
  };
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ tab?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const rawTab = searchParams?.tab;
  const activeTab =
    rawTab === "table" ||
    rawTab === "accounts" ||
    rawTab === "chart" ||
    rawTab === "widgets"
      ? rawTab
      : "widgets";
  const checkoutSuccess = searchParams?.success === "true";

  return (
    <DashboardTabShell activeTab={activeTab} checkoutSuccess={checkoutSuccess} />
  );
}
