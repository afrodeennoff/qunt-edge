'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"
import { Logo } from "@/components/logo"
import { UserAuthForm } from "../components/user-auth-form"
import { useCurrentLocale, useI18n } from "@/locales/client"

export default function AuthenticationPage() {
  const t = useI18n()
  const locale = useCurrentLocale()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b14] text-zinc-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[36rem] w-[36rem] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[34rem] w-[34rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:26px_26px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between px-6 pb-8 pt-6 sm:px-10 lg:px-14 lg:py-10">
          <div>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-200 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to website
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="my-12 max-w-xl"
          >
            <div className="mb-7 inline-flex items-center gap-3 rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3">
              <Logo className="h-5 w-5 text-cyan-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Qunt Edge</span>
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Trade with discipline.
              <br />
              Journal with clarity.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              {t('authentication.description')}
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Security</p>
                <p className="mt-1 text-sm text-zinc-100">Protected sessions and encrypted auth flow.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <TrendingUp className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Performance</p>
                <p className="mt-1 text-sm text-zinc-100">Track progress across every trading session.</p>
              </div>
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('authentication.title')}</span>
          </div>
        </section>

        <section className="flex items-center px-4 pb-8 sm:px-8 lg:px-10 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
            className="w-full rounded-[28px] border border-white/15 bg-[#0b1322]/90 p-5 shadow-[0_20px_80px_-35px_rgba(34,211,238,0.55)] backdrop-blur-xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Account Access</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Welcome back</h2>
                <p className="mt-1 text-xs text-zinc-400">{t('authentication.testimonialAuthor')}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-2.5">
                <LockKeyhole className="h-4 w-4 text-cyan-200" />
              </div>
            </div>

            <UserAuthForm />

            <p className="mt-7 text-center text-[11px] leading-relaxed text-zinc-400">
              {t('authentication.termsAndPrivacy.prefix')} {" "}
              <Link href={`/${locale}/terms`} className="text-zinc-200 underline decoration-zinc-500/70 underline-offset-4 hover:text-white">
                {t('authentication.termsAndPrivacy.terms')}
              </Link>{" "}
              {t('authentication.termsAndPrivacy.and')}{" "}
              <Link href={`/${locale}/privacy`} className="text-zinc-200 underline decoration-zinc-500/70 underline-offset-4 hover:text-white">
                {t('authentication.termsAndPrivacy.privacy')}
              </Link>
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
