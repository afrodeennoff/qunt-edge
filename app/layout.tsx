import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ScrollLockFixLazy from "@/components/lazy/scroll-lock-fix-lazy";
import { Geist, Poppins } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
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
        "fr-FR": "https://qunt-edge.vercel.app/fr",
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
    manifest: "/site.webmanifest",

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

  return (
    <html
      lang="en"
      className={`bg-background ${geist.variable} ${poppins.variable}`}
      translate="no"
      suppressHydrationWarning
      style={{ ["--theme-intensity" as string]: "100%" }}
    >
      <head>
        {/* Resource Hinting for Performance */}
        <link rel="dns-prefetch" href="https://qunt-edge.vercel.app" />

        {/* Mobile-First Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#040404" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no, address=no, email=no" />

        {/* Accessibility & SEO */}
        <meta name="google" content="notranslate" />
        <meta name="robots" content="index, follow" />

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

        <style>
          {`
            /* Base layout */
            html {
              margin: 0;
              padding: 0;
              scrollbar-gutter: stable !important;
              -ms-overflow-style: scrollbar !important;
            }

            /* Style the scrollbar */
            ::-webkit-scrollbar {
              width: 14px !important;
              background-color: transparent !important;
            }

            ::-webkit-scrollbar-track {
              background: hsl(var(--background)) !important;
              border-left: 1px solid hsl(var(--border)) !important;
            }

            ::-webkit-scrollbar-thumb {
              background: hsl(var(--muted-foreground) / 0.3) !important;
              border-radius: 7px !important;
              border: 3px solid hsl(var(--background)) !important;
              min-height: 40px !important;
            }

            ::-webkit-scrollbar-thumb:hover {
              background: hsl(var(--muted-foreground) / 0.4) !important;
            }

            /* Firefox scrollbar styles */
            * {
              scrollbar-width: thin !important;
              scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent !important;
            }

            /* Prevent Radix UI Dialog from adding padding-right/margin-right to body */
            /* Since we use scrollbar-gutter: stable, we don't need the padding/margin */
            body[data-scroll-locked],
            body[style*="padding-right"],
            body[style*="margin-right"] {
              padding-right: 0 !important;
              margin-right: 0 !important;
            }
            
            /* Also target any Radix scroll lock classes */
            body.radix-scroll-lock,
            body[class*="scroll-lock"] {
              padding-right: 0 !important;
              margin-right: 0 !important;
            }
            
            /* Force margin-right to 0 when body has pointer-events: none (Radix UI scroll lock) */
            body[style*="pointer-events: none"] {
              margin-right: 0 !important;
              padding-right: 0 !important;
            }
          `}
        </style>
      </head>
      <body className="font-sans [font-family:var(--font-geist)]">
        <ScrollLockFixLazy />
        {isProduction ? <SpeedInsights /> : null}
        {isProduction ? <Analytics /> : null}
        {children}
      </body>
    </html>
  );
}
