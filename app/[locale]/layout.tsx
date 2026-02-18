import { I18nProviderClient } from "@/locales/client";
import { RootProviders } from "@/components/providers/root-providers";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";
import { cookies } from "next/headers";

export default async function RootLayout(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";

  return (
    <I18nProviderClient locale={locale}>
      <RootProviders defaultOpen={defaultOpen}>
        <ConsentBannerLazy />
        {children}
      </RootProviders>
    </I18nProviderClient>
  );
}
