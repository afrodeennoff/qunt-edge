'use client'

import Link from "next/link"
import { UserAuthForm } from "../components/user-auth-form"
import { Logo } from "@/components/logo"
import { useI18n, useCurrentLocale } from '@/locales/client'
import { motion } from 'framer-motion'

export default function AuthenticationPage() {
  const t = useI18n()
  const locale = useCurrentLocale()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--mk-bg-0))] selection:bg-[hsl(var(--brand-primary))/0.3] selection:text-[hsl(var(--mk-text))] overflow-hidden">

      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[hsl(var(--brand-primary))/0.08] rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[hsl(var(--chart-7))/0.08] rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Brand Header */}
          <Link href={`/${locale}`} className="mb-8 group flex flex-col items-center">
            <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-[hsl(var(--brand-primary))/0.2] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-[hsl(var(--mk-surface))] border border-[hsl(var(--mk-border)/0.35)] p-3 rounded-2xl shadow-xl">
                <Logo className="w-10 h-10 text-[hsl(var(--brand-primary))]" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-[hsl(var(--mk-text))]">
                Welcome to <span className="text-[hsl(var(--brand-primary))]">Qunt Edge</span>
              </h1>
              <p className="text-sm text-[hsl(var(--mk-text-muted))] font-medium tracking-wide">
                {t('authentication.description')}
              </p>
            </div>
          </Link>

          {/* Auth Card */}
          <div className="w-full relative group">
            <div className="absolute -inset-0.5 bg-[hsl(var(--brand-primary))/0.2] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

            <div className="relative bg-[hsl(var(--mk-surface))/0.92] backdrop-blur-xl border border-[hsl(var(--mk-border)/0.35)] rounded-xl p-8 shadow-xl">
              <div className="mb-6 text-center">
                <h2 className="text-sm font-semibold text-[hsl(var(--mk-text))] uppercase tracking-widest mb-1">{t('authentication.title')}</h2>
                <p className="text-xs text-[hsl(var(--mk-text-muted))]">{t('authentication.testimonialAuthor')}</p>
              </div>

              <UserAuthForm />

              {/* Secure Footer */}
              <div className="mt-8 pt-6 border-t border-[hsl(var(--mk-border)/0.3)] text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-[10px] text-[hsl(var(--mk-text-muted))] uppercase tracking-widest">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[hsl(var(--brand-primary))/0.8]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Secure Encryption</span>
                </div>

                <p className="text-[10px] leading-relaxed text-[hsl(var(--mk-text-muted))]">
                  {t('authentication.termsAndPrivacy.prefix')}{" "}
                  <Link href={`/${locale}/terms`} className="text-[hsl(var(--mk-text))] hover:text-[hsl(var(--brand-primary))] transition-colors underline decoration-[hsl(var(--mk-border))] underline-offset-2">
                    {t('authentication.termsAndPrivacy.terms')}
                  </Link>{" "}
                  {t('authentication.termsAndPrivacy.and')}{" "}
                  <Link href={`/${locale}/privacy`} className="text-[hsl(var(--mk-text))] hover:text-[hsl(var(--brand-primary))] transition-colors underline decoration-[hsl(var(--mk-border))] underline-offset-2">
                    {t('authentication.termsAndPrivacy.privacy')}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[10px] text-[hsl(var(--mk-text-muted))] font-mono uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Qunt Edge
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
