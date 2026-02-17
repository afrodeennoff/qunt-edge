import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ScrollLockFixLazy from "@/components/lazy/scroll-lock-fix-lazy";
import { getUiVariant } from "@/lib/ui-v2";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Qunt Edge",
    description: "Next generation trading dashboard",
    metadataBase: new URL("https://qunt-edge.vercel.app"),
    alternates: {
      canonical: "https://qunt-edge.vercel.app",
      languages: {
        "en-US": "https://qunt-edge.vercel.app",
      },
    },
    // ---------- OPEN GRAPH ----------
    openGraph: {
      title: "Qunt Edge",
      description:
        "Qunt Edge is a next generation trading dashboard that provides real-time insights and analytics for traders.",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Qunt Edge Open Graph Image",
        },
      ],
    },

    // ---------- TWITTER ----------
    twitter: {
      card: "summary_large_image",
      title: "Qunt Edge",
      description: "Next generation trading dashboard",
      images: ["/twitter-image.png"],
    },

    // ---------- ICONS ----------
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      other: [
        { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
        {
          rel: "android-chrome",
          sizes: "192x192",
          url: "/android-chrome-192x192.png",
        },
        {
          rel: "android-chrome",
          sizes: "512x512",
          url: "/android-chrome-512x512.png",
        },
      ],
    },

    // ---------- PWA ----------
    manifest: "/manifest.json",

    // ---------- ROBOTS ----------
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ---------- OTHER ----------
    other: { google: "notranslate" },
    authors: [{ name: "TIMON" }],
    creator: "TIMON",
    publisher: "TIMON",
    formatDetection: { email: false, address: false, telephone: false },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction = process.env.NODE_ENV === "production";
  const uiVariant = getUiVariant();
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html
      lang="en"
      className="bg-background"
      data-ui-variant={uiVariant}
      translate="no"
      suppressHydrationWarning
      style={{ ["--theme-intensity" as string]: "100%" }}
    >
      <head>
        {/* Resource Hinting for Performance */}
        <link rel="dns-prefetch" href="https://qunt-edge.vercel.app" />
        <link rel="preconnect" href="https://qunt-edge.vercel.app" crossOrigin="anonymous" />
        {cdnUrl ? <link rel="preconnect" href={cdnUrl} crossOrigin="anonymous" /> : null}
        {supabaseUrl ? <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" /> : null}

        {/* Mobile-First Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Apply stored theme before paint to avoid blank flash */}
        <Script id="init-theme" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var root = document.documentElement;
                var savedTheme = localStorage.getItem('theme');
                var resolvedTheme = savedTheme === 'dark'
                  ? 'dark'
                  : savedTheme === 'light'
                    ? 'light'
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

                root.classList.remove('light', 'dark');
                root.classList.add(resolvedTheme);

                var savedIntensity = localStorage.getItem('intensity');
                var intensity = savedIntensity ? Number(savedIntensity) : 100;
                root.style.setProperty('--theme-intensity', intensity + '%');
              } catch (e) {
                // Fail silently to avoid blocking render
              }
            })();
          `}
        </Script>

        {/* PostHog Analytics */}
        {/*{process.env.NODE_ENV === "production" && (
          <Script id="posthog-analytics" strategy="lazyOnload">
            {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_NS2VmvRg0gY0tMBpq3tMX3gOBQdG79VOciAh8NDWSeX', {
                api_host: 'https://eu.i.posthog.com',
                person_profiles: 'identified_only',
            })
            `}
          </Script>
        )}*/}

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="180x180"
          href="/apple-touch-icon-precomposed.png"
        />

      </head>
      <body
        className="font-sans antialiased text-foreground"
        data-ui-variant={uiVariant}
      >
        <ScrollLockFixLazy />
        {isProduction ? <WebVitalsReporter /> : null}
        {isProduction ? <SpeedInsights /> : null}
        {isProduction ? <Analytics /> : null}
        {children}
      </body>
    </html>
  );
}
