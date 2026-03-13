import type { Metadata } from "next";
import { TermsPageClient } from './terms-page-client';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Terms of Service | Qunt Edge",
  description:
    "Review Qunt Edge terms for subscriptions, data usage, service availability, and account responsibilities.",
};

export default function TermsPage() {
  return <TermsPageClient />;
}
