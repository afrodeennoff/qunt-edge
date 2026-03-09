import { I18nProviderClient } from "@/locales/client";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";

export default async function RootLayout(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  return (
    <I18nProviderClient locale={locale}>
      <ConsentBannerLazy />
      {children}
    </I18nProviderClient>
  );
}
