
"use client"

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="py-fluid-lg px-fluid-sm border-t border-white/5 bg-[#050505]">
            <div className="container-fluid flex flex-col md:flex-row justify-between items-center gap-fluid-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center font-bold text-black text-xs">Q</div>
                    <span className="text-sm font-bold tracking-tighter uppercase mono">Qunt Edge</span>
                </div>

                <div className="grid grid-cols-2 gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500 max-w-md">
                    <div className="flex flex-col gap-2">
                        <span className="text-white mb-2">Product</span>
                        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/propfirms" className="hover:text-white transition-colors">Prop Firms Catalogue</Link>
                        <Link href="/teams" className="hover:text-white transition-colors">Teams</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-white mb-2">Support</span>
                        <Link href="/support" className="hover:text-white transition-colors">Support Center</Link>
                        <Link href="/community" className="hover:text-white transition-colors">Community</Link>
                        <Link href="/updates" className="hover:text-white transition-colors">Roadmap</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/disclaimers" className="hover:text-white transition-colors">Disclaimers</Link>
                    </div>
                </div>
                <div className="text-[10px] mono text-zinc-600">
                    © {new Date().getFullYear()} Qunt Edge. All rights reserved. Professional trading analytics.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
