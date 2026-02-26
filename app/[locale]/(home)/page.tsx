
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';

export function generateStaticParams() {
    return getStaticParams();
}

export const revalidate = 180;
// export const dynamic = "force-static"; // Removed for webapp flexibility
// export const dynamicParams = false;

export const metadata: Metadata = {
    title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
    description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
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
