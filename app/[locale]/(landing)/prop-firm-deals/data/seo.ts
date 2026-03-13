import type { Metadata } from 'next'
import type { FaqItem } from './types'

const SITE_ORIGIN = 'https://qunt-edge.vercel.app'
const PAGE_PATH = '/prop-firm-deals'

export const PROP_FIRM_DEALS_LAST_UPDATED = 'March 13, 2026'
export const PROP_FIRM_DEALS_TITLE = 'Prop Firm Deals & Comparison | Qunt Edge'
export const PROP_FIRM_DEALS_DESCRIPTION =
  'Browse verified discount codes, compare prop firms side by side, and access trader tools in one Qunt Edge workspace.'

export function buildPropFirmDealsCanonical(locale: string): string {
  return `${SITE_ORIGIN}/${locale}${PAGE_PATH}`
}

export function buildPropFirmDealsMetadata(locale: string): Metadata {
  const canonical = buildPropFirmDealsCanonical(locale)

  return {
    title: PROP_FIRM_DEALS_TITLE,
    description: PROP_FIRM_DEALS_DESCRIPTION,
    alternates: {
      canonical,
      languages: {
        'en-US': `${SITE_ORIGIN}/en${PAGE_PATH}`,
        'fr-FR': `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
    openGraph: {
      title: PROP_FIRM_DEALS_TITLE,
      description: PROP_FIRM_DEALS_DESCRIPTION,
      url: canonical,
      siteName: 'Qunt Edge',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: PROP_FIRM_DEALS_TITLE,
      description: PROP_FIRM_DEALS_DESCRIPTION,
    },
  }
}

export function buildPropFirmDealsFaqSchema(faqs: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
