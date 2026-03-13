import type { Metadata } from "next";
import ReferralPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Referral Program | Qunt Edge",
  description:
    "Invite traders to Qunt Edge and earn rewards through the official referral program.",
};

export const revalidate = 1800;

export default function ReferralPage() {
  return <ReferralPageClient />;
}
