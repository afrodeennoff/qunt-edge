
"use client"

import React from 'react';
import Link from 'next/link';
import { useCurrentLocale } from '@/locales/client';

const Footer: React.FC = () => {
    const locale = useCurrentLocale();
    return (
        <footer className="py-fluid-lg px-fluid-sm border-t border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-bg-0))]">
            <div className="container-fluid flex flex-col md:flex-row justify-between items-center gap-fluid-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[hsl(var(--mk-text))] rounded-sm flex items-center justify-center font-bold text-[hsl(var(--brand-ink))] text-xs">Q</div>
                    <span className="text-sm font-bold tracking-tighter uppercase mono">Qunt Edge</span>
                </div>

                <div className="grid grid-cols-2 gap-8 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--mk-text-muted))] max-w-md">
                    <div className="flex flex-col gap-2">
                        <span className="text-[hsl(var(--mk-text))] mb-2">Product</span>
                        <Link href={`/${locale}/#features`} className="hover:text-white transition-colors">Features</Link>
                        <Link href={`/${locale}/pricing`} className="hover:text-white transition-colors">Pricing</Link>
                        <Link href={`/${locale}/propfirms`} className="hover:text-white transition-colors">Prop Firms Catalogue</Link>
                        <Link href={`/${locale}/teams`} className="hover:text-white transition-colors">Teams</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[hsl(var(--mk-text))] mb-2">Support</span>
                        <Link href={`/${locale}/support`} className="hover:text-white transition-colors">Support Center</Link>
                        <Link href={`/${locale}/community`} className="hover:text-white transition-colors">Community</Link>
                        <Link href={`/${locale}/updates`} className="hover:text-white transition-colors">Roadmap</Link>
                        <Link href={`/${locale}/about`} className="hover:text-white transition-colors">About</Link>
                        <Link href={`/${locale}/faq`} className="hover:text-white transition-colors">FAQ</Link>
                        <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">Privacy</Link>
                        <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">Terms</Link>
                        <Link href={`/${locale}/disclaimers`} className="hover:text-white transition-colors">Disclaimers</Link>
                    </div>
                </div>
                <div className="text-[10px] mono text-[hsl(var(--mk-text-muted))]">
                    © {new Date().getFullYear()} Qunt Edge. All rights reserved. Professional trading analytics.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
