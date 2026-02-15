'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, Trophy, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, HandCoins } from "lucide-react"
import { useI18n } from "@/locales/client"
import Link from "next/link"

export default function ReferralPage() {
  const t = useI18n()
  const affiliateUrl = "https://whop.com/quantedge-solutions/affiliates"

  const tiers = [
    { count: 1, reward: t('referral.landing.tier1Reward'), icon: <Gift className="w-5 h-5 text-blue-500" /> },
    { count: 3, reward: t('referral.landing.tier2Reward'), icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
    { count: 5, reward: t('referral.landing.tier3Reward'), icon: <Trophy className="w-5 h-5 text-yellow-500" /> },
  ]

  const requirements = [
    {
      title: t('referral.landing.requirement1Title'),
      description: t('referral.landing.requirement1Description'),
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    },
    {
      title: t('referral.landing.requirement2Title'),
      description: t('referral.landing.requirement2Description'),
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    },
  ]

  return (
    <div className="px-4 py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 border-white/15 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white shadow-2xl">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <Badge className="w-fit bg-white/10 text-white hover:bg-white/10">
                  {t('referral.landing.heroBadge')}
                </Badge>
                <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                  {t('referral.landing.heroTitle')}
                </h1>
                <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
                  {t('referral.landing.heroDescription')}
                </p>
                <p className="text-xs text-zinc-400">
                  {t('referral.landing.affiliateLinkLabel')}: {affiliateUrl}
                </p>
              </div>

              <div className="w-full md:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full gap-2 bg-white text-black hover:bg-zinc-100 md:w-auto"
                >
                  <Link href={affiliateUrl} target="_blank" rel="noopener noreferrer">
                    <HandCoins className="h-4 w-4" />
                    {t('referral.landing.affiliateCta')}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('referral.landing.title')}</h2>
          <p className="text-lg text-muted-foreground">
            {t('referral.landing.subtitle')}
          </p>
        </div>

        {/* How It Works Section */}
        <Card className="mb-8 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.howItWorks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('referral.landing.step1Title')}</h3>
                  <p className="text-muted-foreground">{t('referral.landing.step1Description')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('referral.landing.step2Title')}</h3>
                  <p className="text-muted-foreground">{t('referral.landing.step2Description')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('referral.landing.step3Title')}</h3>
                  <p className="text-muted-foreground">{t('referral.landing.step3Description')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        <Card className="mb-8 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.requirements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {t('referral.landing.requirementsDescription')}
            </p>
            <div className="space-y-4">
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-lg border border-white/10 bg-muted/30">
                  <div className="flex-shrink-0 mt-0.5">
                    {req.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{req.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Tiers Section */}
        <Card className="mb-8 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.rewards')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-white/10 bg-muted/20 flex flex-col items-center text-center transition-colors hover:bg-muted/35"
                >
                  <div className="mb-4">{tier.icon}</div>
                  <Badge variant="secondary" className="mb-3">
                    {t('referral.landing.tierBadge', { count: tier.count })}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tier.reward}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">{t('referral.landing.importantNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc list-inside text-muted-foreground">
              <li>{t('referral.landing.note1')}</li>
              <li>{t('referral.landing.note2')}</li>
              <li>{t('referral.landing.note3')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
