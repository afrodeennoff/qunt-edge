
"use client"

import React from 'react';
import Link from 'next/link';
import { useCurrentLocale } from '@/locales/client';

const Footer: React.FC = () => {
    const locale = useCurrentLocale();
    return (
        <footer className="py-fluid-lg px-fluid-sm border-t border-border/60 bg-background">
            <div className="container-fluid grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr_auto] md:items-start">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center font-bold text-primary-foreground text-xs">Q</div>
                    <span className="text-sm font-bold tracking-tighter uppercase mono text-foreground">Qunt Edge</span>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground max-w-2xl sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <span className="text-foreground mb-2">Product</span>
                        <Link href={`/${locale}/#features`} className="hover:text-foreground transition-colors">Features</Link>
                        <Link href={`/${locale}/pricing`} className="hover:text-foreground transition-colors">Pricing</Link>
                        <Link href={`/${locale}/propfirms`} className="hover:text-foreground transition-colors">Prop Firms Catalogue</Link>
                        <Link href={`/${locale}/teams`} className="hover:text-foreground transition-colors">Teams</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-foreground mb-2">Support</span>
                        <Link href={`/${locale}/support`} className="hover:text-foreground transition-colors">Support Center</Link>
                        <Link href={`/${locale}/community`} className="hover:text-foreground transition-colors">Community</Link>
                        <Link href={`/${locale}/updates`} className="hover:text-foreground transition-colors">Roadmap</Link>
                        <Link href={`/${locale}/about`} className="hover:text-foreground transition-colors">About</Link>
                        <Link href={`/${locale}/faq`} className="hover:text-foreground transition-colors">FAQ</Link>
                        <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href={`/${locale}/disclaimers`} className="hover:text-foreground transition-colors">Disclaimers</Link>
                    </div>
                </div>
                <div className="text-xs mono text-muted-foreground md:text-right">
                    © {new Date().getFullYear()} Qunt Edge. All rights reserved. Professional trading analytics.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
