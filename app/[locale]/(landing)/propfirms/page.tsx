import { Metadata } from 'next'
import { getI18n } from '@/locales/server'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getPropfirmCatalogueData } from './actions/get-propfirm-catalogue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AccountsBarChart } from './components/accounts-bar-chart'
import { SortControls } from './components/sort-controls'
import { TimeframeControls } from './components/timeframe-controls'
import type { Timeframe } from './actions/timeframe-utils'
import type { PropfirmCatalogueStats } from './actions/types'

// Keep the translator type intentionally light to avoid "union too complex" TS errors.
type Translator = (key: string, params?: Record<string, unknown>) => string

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getI18n()

  return {
    title: `${t('landing.propfirms.title')} | Qunt Edge`,
    description: t('landing.propfirms.description'),
    openGraph: {
      title: `${t('landing.propfirms.title')} | Qunt Edge`,
      description: t('landing.propfirms.description'),
      url: `https://quntedge.com/${locale}/propfirms`,
      siteName: "Qunt Edge",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t('landing.propfirms.title')} | Qunt Edge`,
      description: t('landing.propfirms.description'),
    },
    alternates: {
      canonical: `./${locale}/propfirms`,
      languages: {
        'x-default': `./en/propfirms`,
        'en': `./en/propfirms`,
      },
    },
  };
}

// Format currency with $ symbol (always USD)
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value)
}

function renderPropfirmCard(
  propfirmName: string,
  stat: PropfirmCatalogueStats,
  t: Translator
) {
  const paidAmount = stat.payouts.paidAmount
  const paidCount = stat.payouts.paidCount
  const pendingAmount = stat.payouts.pendingAmount
  const pendingCount = stat.payouts.pendingCount
  const refusedAmount = stat.payouts.refusedAmount
  const refusedCount = stat.payouts.refusedCount

  return (
    <Card key={propfirmName} className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl tracking-tight">{propfirmName}</CardTitle>
          <div className="text-right">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground/70">
            Registered
          </div>
            <p className="text-3xl font-black text-foreground leading-none tabular-nums">
              {stat.accountsCount.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Unified (non-rainbow) KPI strip + remove duplicate "registered" blocks */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-border/60 bg-card/20 text-foreground/80">
            Paid:{' '}
            <span className="ml-1 font-semibold text-foreground tabular-nums">
              {formatCompactCurrency(paidAmount)}
            </span>
          </Badge>
          <Badge variant="outline" className="border-border/60 bg-card/20 text-foreground/80">
            Account Value:{' '}
            <span className="ml-1 font-semibold text-foreground tabular-nums">
              {formatCompactCurrency(stat.totalAccountValue)}
            </span>
          </Badge>
          <Badge variant="outline" className="border-border/60 bg-card/20 text-foreground/80">
            Size Mix:{' '}
            <span className="ml-1 font-semibold text-foreground">
              {stat.sizeBreakdown}
            </span>
          </Badge>
          <Badge variant="outline" className="border-border/60 bg-card/20 text-foreground/80">
            Sized:{' '}
            <span className="ml-1 font-semibold text-foreground tabular-nums">
              {stat.sizedAccountsCount.toLocaleString()}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('landing.propfirms.payouts.title')}</h3>
          <div className="space-y-3">
            {/* Paid */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('landing.propfirms.payouts.paid.label')}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/70">
                {t('landing.propfirms.payouts.count', { count: paidCount })}
              </p>
            </div>

            {/* Pending */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('landing.propfirms.payouts.pending.label')}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(pendingAmount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/70">
                {t('landing.propfirms.payouts.count', { count: pendingCount })}
              </p>
            </div>

            {/* Refused */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('landing.propfirms.payouts.refused.label')}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(refusedAmount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/70">
                {t('landing.propfirms.payouts.count', { count: refusedCount })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PropFirmsPageProps {
  searchParams: Promise<{ sort?: string; timeframe?: string }>
}

export default async function PropFirmsPage({ searchParams }: PropFirmsPageProps) {
  const t = await getI18n()
  const resolvedSearchParams = await searchParams
  const timeframe = (resolvedSearchParams.timeframe || '2026') as Timeframe
  const sortBy = resolvedSearchParams.sort || 'accounts'
  const { stats } = await getPropfirmCatalogueData(timeframe)

  // Create a map of propfirm name -> stats for quick lookup
  const statsMap = new Map(
    stats.map(s => [s.propfirmName, s])
  )

  // Process config propfirms only
  const configPropfirms: Array<{
    key: string
    name: string
    accountTemplatesCount: number
    stats: typeof stats[0] | undefined
  }> = []

  Object.entries(propFirms).forEach(([key, firm]) => {
    const dbStats = statsMap.get(firm.name)
    const accountTemplatesCount = Object.keys(firm.accountSizes).length

    configPropfirms.push({
      key,
      name: firm.name,
      accountTemplatesCount,
      stats: dbStats,
    })
  })

  // Sort propfirms based on selected sort option
  const sortedPropfirms = [...configPropfirms].sort((a, b) => {
    const aStats = a.stats
    const bStats = b.stats

    switch (sortBy) {
      case 'paidPayout': {
        const aPaid = aStats?.payouts.paidAmount ?? 0
        const bPaid = bStats?.payouts.paidAmount ?? 0
        return bPaid - aPaid // Descending
      }
      case 'refusedPayout': {
        const aRefused = aStats?.payouts.refusedAmount ?? 0
        const bRefused = bStats?.payouts.refusedAmount ?? 0
        return bRefused - aRefused // Descending
      }
      case 'accountValue': {
        const aValue = aStats?.totalAccountValue ?? 0
        const bValue = bStats?.totalAccountValue ?? 0
        return bValue - aValue
      }
      case 'accounts':
      default: {
        const aAccounts = aStats?.accountsCount ?? 0
        const bAccounts = bStats?.accountsCount ?? 0
        return bAccounts - aAccounts // Descending
      }
    }
  })

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('landing.propfirms.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {t('landing.propfirms.description')}
          </p>
        </div>

        {/* Accounts bar chart */}
        <div className="mb-12">
          <AccountsBarChart
            data={sortedPropfirms.map(({ name, stats }) => ({
              propfirmName: name,
              accountsCount: stats?.accountsCount ?? 0,
              sizedAccountsCount: stats?.sizedAccountsCount ?? 0,
              totalAccountValue: stats?.totalAccountValue ?? 0,
              paidAmount: stats?.payouts.paidAmount ?? 0,
              pendingAmount: stats?.payouts.pendingAmount ?? 0,
              refusedAmount: stats?.payouts.refusedAmount ?? 0,
              sizeBreakdown: stats?.sizeBreakdown ?? 'No sized accounts',
            }))}
            chartTitle={t('landing.propfirms.chart.title')}
            legendLabels={{
              registeredAccounts: t('landing.propfirms.registeredAccounts'),
              sizedAccounts: 'Sized Accounts',
              totalAccountValue: 'Total Account Value',
              paid: t('landing.propfirms.payouts.paid.label'),
              pending: t('landing.propfirms.payouts.pending.label'),
              refused: t('landing.propfirms.payouts.refused.label'),
            }}
          />
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center gap-4 flex-wrap">
          <TimeframeControls
            timeframeLabel={t('landing.propfirms.timeframe.label')}
            timeframeOptions={{
              currentMonth: t('landing.propfirms.timeframe.currentMonth'),
              last3Months: t('landing.propfirms.timeframe.last3Months'),
              last6Months: t('landing.propfirms.timeframe.last6Months'),
              '2024': t('landing.propfirms.timeframe.2024'),
              '2025': t('landing.propfirms.timeframe.2025'),
              '2026': t('landing.propfirms.timeframe.2026'),
              allTime: t('landing.propfirms.timeframe.allTime'),
            }}
          />
          <SortControls
            sortLabel={t('landing.propfirms.sort.label')}
            sortOptions={{
              accounts: t('landing.propfirms.sort.accounts'),
              paidPayout: t('landing.propfirms.sort.paidPayout'),
              refusedPayout: t('landing.propfirms.sort.refusedPayout'),
              accountValue: 'Account Value',
            }}
          />
        </div>

        {/* Main propfirms grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPropfirms.map(({ name, stats: dbStats }) => {
            const fallback: PropfirmCatalogueStats = {
              propfirmName: name,
              accountsCount: 0,
              sizedAccountsCount: 0,
              totalAccountValue: 0,
              sizeBreakdown: 'No sized accounts',
              sizeDistribution: [],
              payouts: {
                propfirmName: name,
                pendingAmount: 0,
                pendingCount: 0,
                refusedAmount: 0,
                refusedCount: 0,
                paidAmount: 0,
                paidCount: 0,
              },
            }
            const resolvedStats = dbStats ?? fallback
            const payouts = resolvedStats.payouts

            const enrichedStats: PropfirmCatalogueStats = {
              propfirmName: name,
              accountsCount: resolvedStats.accountsCount,
              sizedAccountsCount: resolvedStats.sizedAccountsCount,
              totalAccountValue: resolvedStats.totalAccountValue,
              sizeBreakdown: resolvedStats.sizeBreakdown,
              sizeDistribution: resolvedStats.sizeDistribution,
              payouts: {
                ...payouts,
              },
            }

            return renderPropfirmCard(
              name,
              enrichedStats,
              t as unknown as Translator
            )
          })}
        </div>
      </div>
    </div>
  )
}
