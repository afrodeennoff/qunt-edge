import type { Metadata } from "next";
import { Suspense } from 'react';
import { AdminDashboard } from '@/app/[locale]/admin/components/dashboard/admin-dashboard';

export const dynamic = "force-dynamic";
const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Admin Dashboard | Qunt Edge",
    description: "Administrative controls and platform management dashboard for Qunt Edge.",
    openGraph: {
      title: "Admin Dashboard | Qunt Edge",
      description: "Administrative controls and platform management dashboard for Qunt Edge.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Admin Dashboard | Qunt Edge",
      description: "Administrative controls and platform management dashboard for Qunt Edge.",
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

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading admin dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
