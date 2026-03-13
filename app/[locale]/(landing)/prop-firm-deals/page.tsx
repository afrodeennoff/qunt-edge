import type { Metadata } from 'next'
import { deals, faqItems, firms } from './data/mock-data'
import { PropFirmDealsExperience } from './components/prop-firm-deals-experience'
import {
  buildPropFirmDealsFaqSchema,
  buildPropFirmDealsMetadata,
  PROP_FIRM_DEALS_LAST_UPDATED,
} from './data/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPropFirmDealsMetadata(locale)
}

export default async function PropFirmDealsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const faqSchema = buildPropFirmDealsFaqSchema(faqItems)

  return (
    <>
      <PropFirmDealsExperience
        locale={locale}
        deals={deals}
        firms={firms}
        faqs={faqItems}
        lastUpdated={PROP_FIRM_DEALS_LAST_UPDATED}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
