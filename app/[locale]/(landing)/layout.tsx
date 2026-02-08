import MarketingLayoutShell from "./components/marketing-layout-shell";

import { Metadata } from 'next';

type Locale = 'en' | 'fr';

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  const descriptions: Record<Locale, string> = {
    en: 'Centralize and visualize your trading performance across multiple brokers. Track, analyze, and improve your trading journey with powerful analytics.',
    fr: 'Centralisez et visualisez vos performances de trading à travers différents brokers. Suivez, analysez et améliorez votre parcours de trading avec des analyses puissantes.',
  };

  const description = descriptions[params.locale] || descriptions.en;

  return {
    title: 'Qunt Edge',
    description,
  };
}

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>
) {
  const {
    children,
    params
  } = props;

  // Await the params since it's now a Promise in Next.js 15
  await params;

  return (
    <MarketingLayoutShell contentClassName="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div>
        {children}
      </div>
    </MarketingLayoutShell>
  );
}
