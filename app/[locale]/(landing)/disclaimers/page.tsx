'use client'
import { useI18n } from '@/locales/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

export default function DisclaimersPage() {
  const t = useI18n()
  const extendedDisclaimer = `Trading futures, options, and foreign exchange involves substantial risk and is not suitable for all individuals. Financial instruments may fluctuate in value, and losses may exceed the initial investment, particularly when leverage is used. All trading decisions are made at the individual's own discretion, and any profits or losses are solely the responsibility of the trader. Any performance examples shown are hypothetical and provided for educational purposes only and do not represent actual trading results. Past performance is not indicative of future results, and no representation is made that any account will or is likely to achieve profits or losses similar to those shown. Trade only with capital you can afford to lose.

DISCLAIMER: Futures and forex trading contain substantial risk and is not for every investor. An investor could potentially lose all or more than the initial investment. Risk capital is money that can be lost without jeopardizing ones' financial security or lifestyle. Only risk capital should be used for trading, and only those with sufficient risk capital should consider trading. Past performance is not necessarily indicative of future results.`

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <div className="space-y-6">
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle>{t('disclaimer.risk.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {t('disclaimer.risk.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle>{t('disclaimer.hypothetical.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {t('disclaimer.hypothetical.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle>Extended Risk Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{extendedDisclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </UnifiedPageShell>
  )
}
