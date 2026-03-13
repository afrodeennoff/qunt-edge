import type { Metadata } from "next";
import SupportPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Support | Qunt Edge",
  description: "Get help with setup, billing, integrations, and trading performance workflows.",
};

export default function SupportPage() {
  return <SupportPageClient />;
}
