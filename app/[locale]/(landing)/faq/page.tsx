import { Metadata } from 'next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { setStaticParamsLocale } from "next-international/server";
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";

export const metadata: Metadata = {
    title: 'FAQ | Qunt Edge',
    description: 'Frequently asked questions about Qunt Edge trading analytics and behavioral intelligence.',
};

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    const faqs = [
        {
            question: "What makes Qunt Edge different from traditional journals?",
            answer: "Traditional journals focus on PnL—a lagging indicator. Qunt Edge audits your clinical execution. We help you identify the behavioral leakages that happen between the chart and the trade button."
        },
        {
            question: "Which brokers and platforms do you support?",
            answer: "We support major institutional and retail platforms including Tradovate, Rithmic, Interactive Brokers (IBKR), and CQG. We are constantly adding new connectors based on community demand."
        },
        {
            question: "Is my trading data secure?",
            answer: "Security is our primary directive. Your trading data is encrypted and stored using institutional-grade protocols. We never share your individual trade data with third parties."
        },
        {
            question: "Does Qunt Edge provide trading signals?",
            answer: "No. Qunt Edge is an intelligence layer, not a signal service. We provide the tools for you to audit your own system and psychology to become a more consistent discretionary trader."
        },
        {
            question: "Can I use Qunt Edge for my trading team?",
            answer: "Yes, our Teams feature is specifically designed for proprietary trading firms and private funds to manage multiple traders with unified risk and behavioral analytics."
        }
    ];

    return (
        <UnifiedPageShell widthClassName="max-w-4xl" className="py-8">
            <UnifiedSurface className="space-y-4">
                <header className="mb-6">
                    <h1 className="text-3xl font-semibold text-fg-primary">Frequently Asked Questions</h1>
                    <p className="mt-1 text-fg-muted">Find answers to common questions about the platform and its features.</p>
                </header>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="mb-3 rounded-2xl border border-white/10 bg-black/35 px-4">
                            <AccordionTrigger className="text-left font-semibold text-fg-primary hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pt-2 leading-relaxed text-fg-muted">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </UnifiedSurface>

            <UnifiedSurface className="mt-6 text-center">
                <h2 className="mb-2 text-xl font-semibold text-fg-primary">Still have questions?</h2>
                <p className="mb-5 text-fg-muted">We&apos;re here to help you elevate your trading execution.</p>
                <a
                    href={`/${locale}/support`}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200"
                >
                    Contact Support
                </a>
            </UnifiedSurface>
        </UnifiedPageShell>
    );
}
