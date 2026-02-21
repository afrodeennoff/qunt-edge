import { I18nProviderClient } from "@/locales/client";
import { RootProviders } from "@/components/providers/root-providers";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";
import { cookies } from "next/headers";

const SIDEBAR_COOKIE_NAME = "sidebar:state";

export default async function RootLayout(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value;
  const defaultOpen = sidebarCookie === "false" ? false : true;

  return (
    <I18nProviderClient locale={locale}>
      <RootProviders defaultOpen={defaultOpen}>
        <ConsentBannerLazy />
        {children}
      </RootProviders>
    </I18nProviderClient>
  );
}
