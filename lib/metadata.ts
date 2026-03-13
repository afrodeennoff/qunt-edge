import { Metadata } from 'next';

const siteOrigin = "https://qunt-edge.vercel.app";

export function generateMetadata({
  title,
  description,
  path = '/',
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = `${title} | Qunt Edge`;
  const url = `${siteOrigin}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Qunt Edge',
      type: 'website',
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Qunt Edge Open Graph Image",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ["/twitter-image.png"],
    },
  };
}
