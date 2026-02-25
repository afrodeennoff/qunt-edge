'use client'

import { useEffect } from 'react'
import Link from "next/link"
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from '@/locales/client'
import { getCalApi } from "@calcom/embed-react"
import {
  Users,
  BarChart3,
  Shield,
  Clock,
  FileText,
  Code,
  Building2,
  Target,
  Globe,
} from 'lucide-react'
import { UnifiedPageHeader, UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

export default function TeamPage() {
  const t = useI18n()

  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi({ namespace: "qunt-edge-team" })
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" })
    })()
  }, [])

  const features = [
    { icon: Users, title: t('teams.features.multiAccount.title'), description: t('teams.features.multiAccount.description') },
    { icon: BarChart3, title: t('teams.features.teamAnalytics.title'), description: t('teams.features.teamAnalytics.description') },
    { icon: Clock, title: t('teams.features.realTime.title'), description: t('teams.features.realTime.description') },
    { icon: Shield, title: t('teams.features.riskManagement.title'), description: t('teams.features.riskManagement.description') },
    { icon: FileText, title: t('teams.features.compliance.title'), description: t('teams.features.compliance.description') },
    { icon: Code, title: t('teams.features.api.title'), description: t('teams.features.api.description') },
  ]

  const useCases = [
    { icon: Building2, title: t('teams.usecases.fund.title'), description: t('teams.usecases.fund.description') },
    { icon: Target, title: t('teams.usecases.prop.title'), description: t('teams.usecases.prop.description') },
    { icon: Users, title: t('teams.usecases.family.title'), description: t('teams.usecases.family.description') },
    { icon: Globe, title: t('teams.usecases.institutional.title'), description: t('teams.usecases.institutional.description') },
  ]

  const stats = [
    { value: '500+', label: t('teams.stats.traders') },
    { value: '2,000+', label: t('teams.stats.accounts') },
    { value: '50+', label: t('teams.stats.brokers') },
  ]

  return (
    <UnifiedPageShell className="py-8">
      <UnifiedPageHeader
        eyebrow="Teams"
        title={t('teams.hero.title')}
        description={t('teams.hero.description')}
        actions={
          <>
            <Link
              href="/authentication?next=teams/dashboard"
              className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              {t('teams.cta')}
            </Link>
            <button
              className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-black/50 px-6 text-sm font-semibold text-fg-primary transition-colors hover:bg-black/70"
              data-cal-namespace="qunt-edge-team"
              data-cal-link="hugo-demenez/qunt-edge-team"
              data-cal-config='{"layout":"month_view"}'
            >
              {t('teams.cta.secondary')}
            </button>
          </>
        }
      />

      <UnifiedSurface className="mb-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-black/35 p-4">
                <p className="text-2xl font-semibold text-fg-primary">{stat.value}</p>
                <p className="text-sm text-fg-muted">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/35 p-2">
            <Image
              alt="Team dashboard"
              src="/business-dark.png"
              width={2432}
              height={1442}
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </UnifiedSurface>

      <UnifiedSurface className="mb-6">
        <h2 className="mb-2 text-2xl font-semibold text-fg-primary">{t('teams.features.title')}</h2>
        <p className="mb-6 text-fg-muted">{t('teams.features.description')}</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-white/10 bg-black/35">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/60">
                  <feature.icon className="h-5 w-5 text-fg-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </UnifiedSurface>

      <UnifiedSurface className="mb-6">
        <h2 className="mb-2 text-2xl font-semibold text-fg-primary">{t('teams.usecases.title')}</h2>
        <p className="mb-6 text-fg-muted">{t('teams.usecases.description')}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="border-white/10 bg-black/35">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/60">
                  <useCase.icon className="h-5 w-5 text-fg-primary" />
                </div>
                <CardTitle className="text-lg">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{useCase.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </UnifiedSurface>

      <UnifiedSurface className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-fg-primary">{t('teams.cta.createAccount.title')}</h2>
        <p className="mb-5 text-fg-muted">{t('teams.cta.createAccount.description')}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/authentication?next=teams/dashboard"
            className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            {t('teams.cta.createAccount.button')}
          </Link>
          <button
            className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-black/50 px-6 text-sm font-semibold text-fg-primary transition-colors hover:bg-black/70"
            data-cal-namespace="qunt-edge-team"
            data-cal-link="hugo-demenez/qunt-edge-team"
            data-cal-config='{"layout":"month_view"}'
          >
            {t('teams.cta.demo.button')}
          </button>
        </div>
        <p className="mt-4 text-sm text-fg-muted">{t('teams.cta.createAccount.subtext')}</p>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
