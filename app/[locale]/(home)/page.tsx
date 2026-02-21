
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';

export function generateStaticParams() {
    return getStaticParams();
}

export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = false;

export const metadata: Metadata = {
    title: 'Qunt Edge | AI Trading Performance Platform',
    description: 'A modern execution intelligence platform for discretionary traders: unify data, diagnose behavior drift, and improve consistency with AI-led review.',
};

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    return <HomeContent />;
}
