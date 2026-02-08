
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/user-store';
import { useI18n } from "@/locales/client";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X, ArrowRight } from 'lucide-react';

interface NavigationProps {
    onAccessPortal: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onAccessPortal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = useUserStore(state => state.supabaseUser);
    const t = useI18n();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const links = [
        { name: t('footer.product.features'), href: '/#features' },
        { name: t('footer.product.pricing'), href: '/pricing' },
        { name: t('landing.navbar.propFirms'), href: '/propfirms' },
        { name: t('footer.product.teams'), href: '/teams' },
        { name: t('footer.product.support'), href: '/support' },
        { name: t('footer.company.about'), href: '/about' },
        { name: 'FAQ', href: '/faq' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled || mobileMenuOpen
                        ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4'
                        : 'bg-transparent py-6'
                )}
            >
                <div className="container-fluid flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group z-50" onClick={() => setMobileMenuOpen(false)}>
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white relative z-10 transition-transform duration-500 group-hover:rotate-180">
                                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                                <circle cx="16" cy="16" r="4" fill="#2dd4bf" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tighter text-white group-hover:text-teal-400 transition-colors uppercase">
                            Qunt Edge
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors relative group py-2"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6">
                            {!user ? (
                                <>
                                    <button
                                        onClick={onAccessPortal}
                                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {t('landing.navbar.signIn')}
                                    </button>
                                    <button
                                        onClick={onAccessPortal}
                                        className="bg-white hover:bg-teal-400 text-black px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_-5px_rgba(45,212,191,0.4)]"
                                    >
                                        {t('landing.cta')}
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="bg-teal-500 hover:bg-teal-400 text-black px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 shadow-[0_0_20px_-5px_rgba(45,212,191,0.3)]"
                                >
                                    {t('landing.navbar.dashboard')}
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-white hover:text-teal-400 transition-colors z-50 focus:outline-none"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Sheet/Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] z-50 bg-[#0A0A0A] border-l border-white/10 lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="pt-24 px-6 pb-6 flex flex-col h-full">
                                <div className="flex flex-col gap-6 mb-8">
                                    {links.map((link, i) => (
                                        <motion.div
                                            key={link.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.05 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block text-2xl font-bold tracking-tight text-white/80 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-auto pt-8 border-t border-white/10 space-y-4"
                                >
                                    {!user ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    onAccessPortal();
                                                }}
                                                className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-white group p-2"
                                            >
                                                {t('landing.navbar.signIn')}
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    onAccessPortal();
                                                }}
                                                className="w-full bg-teal-500 text-black py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-transform"
                                            >
                                                {t('landing.cta')}
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full bg-teal-500 text-black py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest text-center shadow-lg shadow-teal-500/20 active:scale-95 transition-transform"
                                        >
                                            {t('landing.navbar.dashboard')}
                                        </Link>
                                    )}

                                    <div className="pt-4 text-center">
                                        <p className="text-[10px] text-zinc-600 font-mono uppercase">
                                            Qunt Edge Mobile
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
