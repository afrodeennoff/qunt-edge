
import MarketingLayoutShell from "../../(landing)/components/marketing-layout-shell";
import { Metadata } from 'next';

type Locale = 'en' | 'fr';

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  const descriptions: Record<Locale, string> = {
    en: 'Enterprise trading analytics platform for fund managers and proprietary trading firms. Monitor multiple traders, track performance, and make data-driven decisions.',
    fr: 'Plateforme d\'analyses de trading entreprise pour les gestionnaires de fonds et les firmes de trading propriétaire. Surveillez plusieurs traders, suivez les performances et prenez des décisions basées sur les données.',
  };

  const description = descriptions[params.locale] || descriptions.en;

  return {
    title: 'Qunt Edge Enterprise',
    description,
  };
}

export default async function TeamLayout({
  children
}: {
  children: React.ReactNode,
}
) {
  return (
    <MarketingLayoutShell contentClassName="w-full">
      <div>
        {children}
      </div>
    </MarketingLayoutShell>
  );
}
