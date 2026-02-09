import { I18nProviderClient } from "@/locales/client";
import { RootProviders } from "@/components/providers/root-providers";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";

export default async function RootLayout(props: { params: Promise<{ locale: string }>, children: React.ReactNode }) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  return (
    <I18nProviderClient locale={locale}>
      <RootProviders>
        <ConsentBannerLazy />
        {children}
      </RootProviders>
    </I18nProviderClient>
  );
}
