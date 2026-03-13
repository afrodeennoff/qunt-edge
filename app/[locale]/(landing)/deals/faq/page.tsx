import type { Metadata } from 'next'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PublicFlowShell } from '../_components/public-flow-shell'

const SITE_ORIGIN = "https://qunt-edge.vercel.app";
const PAGE_PATH = "/deals/faq";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: 'Qunt Edge Deals FAQ',
    description: 'Answers to common questions about how Qunt Edge Deals are curated, updated, and used.',
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
        "x-default": `${SITE_ORIGIN}/en${PAGE_PATH}`,
      },
    },
    openGraph: {
      title: 'Qunt Edge Deals FAQ',
      description: 'Answers to common questions about how Qunt Edge Deals are curated, updated, and used.',
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Qunt Edge Deals FAQ',
      description: 'Answers to common questions about how Qunt Edge Deals are curated, updated, and used.',
    },
  };
}

const faqItems = [
  {
    question: 'What is Qunt Edge Deals?',
    answer:
      'Qunt Edge Deals is a curated deals surface for futures prop firms. It helps you spot active promos quickly, then move into deeper analysis before you commit to a challenge.',
  },
  {
    question: 'Are these offers maintained in real time?',
    answer:
      'Offers are reviewed frequently and refreshed when terms change. Because firms can update campaigns without notice, always confirm the final checkout details before purchase.',
  },
  {
    question: 'Does Qunt Edge guarantee a discount will still be active?',
    answer:
      'No. We track and surface deals, but final eligibility is controlled by each prop firm. If an offer expires, use the matchup and cost-planning tools to evaluate the next best option.',
  },
  {
    question: 'How should I choose between deals?',
    answer:
      'Start with your risk model and payout timeline, not just the biggest headline discount. Fees, drawdown mechanics, and reset costs can matter more than the first promo percentage.',
  },
  {
    question: 'Where can I ask a question that is not listed here?',
    answer:
      'You can reach Qunt Edge support from the support page. Include the firm name and the offer you saw so we can help you verify the best current path.',
  },
]

export default async function PropfirmPerkFAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
  };

  return (
    <PublicFlowShell
      title="Deals FAQ"
      subtitle="Answers written for the Qunt Edge deals flow, including how offers are curated and how to validate a setup before purchase."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="mt-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Everything on this page is specific to how Qunt Edge presents and maintains prop firm deal information.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Deals basics', 'Offer updates', 'Risk fit', 'Support'].map((chip) => (
              <span key={chip} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/deals`}
              className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Back to Deals
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Contact Support
            </Link>
          </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`} className="rounded-xl border border-border bg-background/50 px-4 mb-3">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-1 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicFlowShell>
  )
}
