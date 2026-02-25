'use client'
import { useI18n } from '@/locales/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnifiedPageHeader, UnifiedPageShell } from '@/components/layout/unified-page-shell'

export default function DisclaimersPage() {
  const t = useI18n()

  return (
    <UnifiedPageShell widthClassName="max-w-5xl" className="py-8">
      <UnifiedPageHeader
        eyebrow="Legal"
        title={t('footer.legal.disclaimers')}
        description="Important risk and performance disclaimers for all platform users."
      />

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
      </div>
    </UnifiedPageShell>
  )
}
