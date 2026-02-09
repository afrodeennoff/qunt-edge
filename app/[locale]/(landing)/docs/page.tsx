import { Metadata } from 'next';
import { getI18n } from "@/locales/server";
import { setStaticParamsLocale } from "next-international/server";

export const metadata: Metadata = {
    title: 'Documentation | Qunt Edge',
    description: 'Comprehensive guides and API references for the Qunt Edge clinical intelligence layer.',
};

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setStaticParamsLocale(locale);
    const t = await getI18n();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Documentation</h1>
                <p className="text-xl text-zinc-400">Everything you need to master the clinical intelligence layer.</p>
            </header>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-teal-500/50 transition-colors group">
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Getting Started</h2>
                    <p className="text-zinc-400 text-sm mb-4">New to Qunt Edge? Learn the basics and set up your institutional-grade dashboard in minutes.</p>
                    <span className="text-teal-500 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-teal-500/50 transition-colors group">
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Data Connectors</h2>
                    <p className="text-zinc-400 text-sm mb-4">Detailed guides on connecting Tradovate, Rithmic, IBKR, and more to your intelligence layer.</p>
                    <span className="text-teal-500 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-teal-500/50 transition-colors group">
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">AI Journaling</h2>
                    <p className="text-zinc-400 text-sm mb-4">How to leverage our unique AI models to audit your behavioral execution, not just your PnL.</p>
                    <span className="text-teal-500 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-teal-500/50 transition-colors group">
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">API Reference</h2>
                    <p className="text-zinc-400 text-sm mb-4">For power users and institutions looking to integrate Qunt Edge analytics into their custom workflows.</p>
                    <span className="text-teal-500 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>
            </div>

            <footer className="mt-24 pt-8 border-t border-white/5 text-center">
                <p className="text-zinc-500 text-sm">Need immediate help? Visit our <a href="/support" className="text-teal-500 hover:underline">Support Center</a> or join our <a href="https://discord.gg/efHDc43M" className="text-teal-500 hover:underline">Discord</a>.</p>
            </footer>
        </div>
    );
}
