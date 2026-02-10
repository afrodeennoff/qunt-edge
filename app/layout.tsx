import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ScrollLockFixLazy from "@/components/lazy/scroll-lock-fix-lazy";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0B0E11",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Qunt Edge",
    description: "Production-grade trading terminal",
    metadataBase: new URL("https://qunt-edge.vercel.app"),
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
      className={`bg-background ${ibmPlexMono.variable} font-mono`}
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <link rel="dns-prefetch" href="https://qunt-edge.vercel.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0B0E11" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-mono bg-background text-foreground antialiased selection:bg-accent selection:text-white">
        <ScrollLockFixLazy />
        {isProduction ? <SpeedInsights /> : null}
        {isProduction ? <Analytics /> : null}
        {children}
      </body>
    </html>
  );
}
