
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';

const SITE_ORIGIN = 'https://qunt-edge.vercel.app'

export function generateStaticParams() {
    return getStaticParams();
}

export const revalidate = 180;
// export const dynamic = "force-static"; // Removed for webapp flexibility
// export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const canonical = `${SITE_ORIGIN}/${locale}`;

    return {
        title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
        description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
        alternates: {
            canonical,
            languages: {
                'en-US': `${SITE_ORIGIN}/en`,
                'fr-FR': `${SITE_ORIGIN}/fr`,
                'x-default': `${SITE_ORIGIN}/en`,
            },
        },
        openGraph: {
            title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
            description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
            url: canonical,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
            description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
        },
    };
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    return <HomeContent locale={locale} />;
}
