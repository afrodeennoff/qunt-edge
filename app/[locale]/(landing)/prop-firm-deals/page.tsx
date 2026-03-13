import type { Metadata } from 'next'
import { deals, faqItems, firms } from './data/mock-data'
import { PropFirmDealsExperience } from './components/prop-firm-deals-experience'

const SITE_ORIGIN = 'https://qunt-edge.vercel.app'
const PAGE_PATH = '/prop-firm-deals'
const LAST_UPDATED = 'March 13, 2026'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`
  const title = 'Prop Firm Deals & Comparison | Qunt Edge'
  const description =
    'Browse verified discount codes, compare prop firms side by side, and access trader tools in one Qunt Edge workspace.'

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en-US': `${SITE_ORIGIN}/en${PAGE_PATH}`,
        'fr-FR': `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Qunt Edge',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PropFirmDealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <PropFirmDealsExperience
        locale={locale}
        deals={deals}
        firms={firms}
        faqs={faqItems}
        lastUpdated={LAST_UPDATED}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
