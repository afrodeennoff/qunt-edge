'use client'

import Link from "next/link"
import { UserAuthForm } from "../components/user-auth-form"
import { Logo } from "@/components/logo"
import { useI18n } from '@/locales/client'
import { motion } from 'framer-motion'

export default function AuthenticationPage() {
  const t = useI18n()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#050505] selection:bg-teal-500/30 selection:text-teal-200 overflow-hidden font-sans">

      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-teal-500/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
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
          <Link href="/" className="mb-8 group flex flex-col items-center">
            <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-[#0A0A0A] border border-white/10 p-3 rounded-2xl shadow-2xl">
                <Logo className="w-10 h-10 text-teal-500" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-white">
                Welcome to <span className="text-teal-500">Qunt Edge</span>
              </h1>
              <p className="text-sm text-zinc-500 font-medium tracking-wide">
                {t('authentication.description')}
              </p>
            </div>
          </Link>

          {/* Auth Card */}
          <div className="w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-teal-500/20 to-purple-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

            <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-1">{t('authentication.title')}</h2>
                <p className="text-xs text-zinc-600">{t('authentication.testimonialAuthor')}</p>
              </div>

              <UserAuthForm />

              {/* Secure Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-[10px] text-zinc-600 uppercase tracking-widest">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-500/70">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Secure Encryption</span>
                </div>

                <p className="text-[10px] leading-relaxed text-zinc-500">
                  {t('authentication.termsAndPrivacy.prefix')}{" "}
                  <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-2">
                    {t('authentication.termsAndPrivacy.terms')}
                  </Link>{" "}
                  {t('authentication.termsAndPrivacy.and')}{" "}
                  <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-2">
                    {t('authentication.termsAndPrivacy.privacy')}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Qunt Edge
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}