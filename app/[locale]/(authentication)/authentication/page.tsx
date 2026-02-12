'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles, Workflow, Gauge, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { UserAuthForm } from "../components/user-auth-form"
import { useCurrentLocale, useI18n } from "@/locales/client"

export default function AuthenticationPage() {
  const t = useI18n()
  const locale = useCurrentLocale()

  const valuePoints = [
    {
      icon: ShieldCheck,
      title: "Secure by default",
      description: "Protected sessions, encrypted auth flow, and trusted providers.",
    },
    {
      icon: Workflow,
      title: "Fast account access",
      description: "Magic link and password flow with clean recovery paths.",
    },
    {
      icon: Gauge,
      title: "Built for daily use",
      description: "Low-friction sign-in designed for active trading routines.",
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040404] text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-8rem] h-[40rem] w-[40rem] rounded-full bg-white/[0.08] blur-3xl" />
        <div className="absolute -right-36 bottom-[-10rem] h-[42rem] w-[42rem] rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:30px_30px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-black/35 shadow-[0_24px_80px_-38px_rgba(255,255,255,0.28)] backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(540px,700px)]">
        <section className="p-6 sm:p-8 lg:border-r lg:border-white/10 lg:p-10">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold tracking-wide text-zinc-200 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to website
            </Link>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Secure Access
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="my-10 max-w-xl lg:my-14"
          >
            <div className="mb-7 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3">
              <Logo className="h-5 w-5 text-white" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-200">Qunt Edge</span>
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome back to
              <br className="hidden sm:block" /> your trading command center.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
              {t('authentication.description')}
            </p>

            <div className="mt-10 grid gap-3">
              {valuePoints.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border border-white/15 bg-white/[0.05] p-2">
                      <point.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{point.title}</p>
                      <p className="mt-1 text-xs text-zinc-400">{point.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('authentication.title')}</span>
          </div>
        </section>

        <section className="flex items-center border-t border-white/10 p-6 sm:p-8 lg:border-t-0 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
            className="w-full"
          >
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Account Access</p>
                <div className="rounded-xl border border-white/15 bg-white/[0.04] p-2.5">
                  <LockKeyhole className="h-4 w-4 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Sign in to continue</h2>
              <p className="mt-1 text-xs text-zinc-400">{t('authentication.testimonialAuthor')}</p>
            </div>

            <div className="mb-6 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span>Magic link and password sign-in</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span>Discord and Google authentication</span>
              </div>
              <div>
                <p className="pl-[1.35rem] text-xs text-zinc-500">Protected session handling for every login method.</p>
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
        </div>
      </div>
    </main>
  )
}
