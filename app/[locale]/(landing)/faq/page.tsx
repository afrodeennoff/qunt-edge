import { Metadata } from 'next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getI18n } from "@/locales/server";
import { setStaticParamsLocale } from "next-international/server";

export const metadata: Metadata = {
    title: 'FAQ | Qunt Edge',
    description: 'Frequently asked questions about Qunt Edge trading analytics and behavioral intelligence.',
};

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setStaticParamsLocale(locale);
    const t = await getI18n();

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
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Frequently Asked Questions</h1>
                <p className="text-xl text-zinc-400">Find answers to common questions about the platform and its features.</p>
            </header>

            <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-white/5 mb-4 px-4 rounded-2xl bg-zinc-900/30">
                            <AccordionTrigger className="text-left text-white hover:text-teal-400 hover:no-underline font-semibold py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400 leading-relaxed pb-6 pt-2">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="mt-24 p-8 rounded-3xl bg-teal-500/5 border border-teal-500/10 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Still have questions?</h2>
                <p className="text-zinc-400 mb-6 font-light">We're here to help you elevate your trading execution.</p>
                <a
                    href="/support"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-teal-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-teal-400 transition-all hover:scale-105"
                >
                    Contact Support
                </a>
            </div>
        </div>
    );
}
