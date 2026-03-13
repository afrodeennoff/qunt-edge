"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/user-store';
import { useI18n, useCurrentLocale } from "@/locales/client";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetDescription,
    SheetTitle,
} from "@/components/ui/sheet";

interface NavigationProps {
    onAccessPortal: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onAccessPortal }) => {
    const [scrolled, setScrolled] = useState(false);
    const user = useUserStore(state => state.supabaseUser);
    const t = useI18n();
    const locale = useCurrentLocale();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { name: t('footer.product.features'), href: `/${locale}/#features` },
        { name: t('footer.product.pricing'), href: `/${locale}/pricing` },
        { name: t('landing.navbar.propFirms'), href: `/${locale}/propfirms` },
        { name: t('landing.navbar.propFirmPerk'), href: `/${locale}/deals` },
        { name: t('footer.product.teams'), href: `/${locale}/teams` },
        { name: t('footer.product.support'), href: `/${locale}/support` },
        { name: t('footer.company.about'), href: `/${locale}/about` },
        { name: 'FAQ', href: `/${locale}/faq` },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? 'bg-background/85 backdrop-blur-xl border-b border-border/40 py-3'
                    : 'bg-background/35 backdrop-blur-md border-b border-transparent py-4'
            )}
        >
            <div className="container-fluid flex items-center justify-between">
                <Link href={`/${locale}`} className="flex items-center gap-2 group z-50">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-foreground relative z-10 transition-transform duration-500 group-hover:rotate-180">
                            <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                            <circle cx="16" cy="16" r="4" fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-foreground group-hover:text-foreground/80 transition-colors uppercase">
                        Qunt Edge
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors relative group py-2"
                        >
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        {!user ? (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={onAccessPortal}
                                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-transparent"
                                    
                                >
                                    {t('landing.navbar.signIn')}
                                </Button>
                                <Button
                                    onClick={onAccessPortal}
                                    className="h-9 px-6 text-xs font-bold uppercase tracking-[0.12em] rounded-lg shadow-sm"
                                >
                                    {t('landing.cta')}
                                </Button>
                            </>
                        ) : (
                            <Button asChild className="h-9 px-6 text-xs font-bold uppercase tracking-[0.12em] rounded-lg shadow-sm">
                                <Link href={`/${locale}/dashboard`}>
                                    {t('landing.navbar.dashboard')}
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden text-foreground hover:text-foreground/80">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[min(88vw,360px)] bg-background/95 backdrop-blur-xl border-border/40 p-0 flex flex-col justify-between">
                            <div className="flex flex-col h-full pt-16 px-6 pb-8">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Primary site navigation and account access actions.
                                </SheetDescription>
                                <div className="flex flex-col gap-6 mb-8 flex-1">
                                    {links.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block text-2xl font-bold tracking-tight text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-auto space-y-4 pt-8 border-t border-border/10">
                                    {!user ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    onAccessPortal();
                                                }}
                                                className="w-full justify-between h-12 text-xs font-bold uppercase tracking-wider"
                                            >
                                                {t('landing.navbar.signIn')}
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    onAccessPortal();
                                                }}
                                                className="w-full h-12 text-xs font-bold uppercase tracking-widest shadow-lg"
                                            >
                                                {t('landing.cta')}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button asChild className="w-full h-12 text-xs font-bold uppercase tracking-widest shadow-lg">
                                            <Link
                                                href={`/${locale}/dashboard`}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {t('landing.navbar.dashboard')}
                                            </Link>
                                        </Button>
                                    )}
                                    <div className="pt-4 text-center">
                                        <p className="text-[10px] text-muted-foreground font-mono uppercase">
                                            Qunt Edge Mobile
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navigation;
