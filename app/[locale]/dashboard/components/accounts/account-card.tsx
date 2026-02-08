'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { TradeProgressChart } from "./trade-progress-chart"
import { Account } from "@/context/data-provider"
import { WidgetSize } from '../../types/dashboard'

interface AccountCardProps {
  account: Account
  onClick?: () => void
  size?: WidgetSize
}

export function AccountCard({ account, onClick, size = 'large' }: AccountCardProps) {
  const t = useI18n()
  
  // Extract metrics from account (computed server-side)
  const metrics = account.metrics
  const isConfigured = metrics?.isConfigured ?? false
  const currentBalance = metrics?.currentBalance ?? account.startingBalance ?? 0
  const remainingToTarget = metrics?.remainingToTarget ?? 0
  const progress = metrics?.progress ?? 0
  const drawdownProgress = metrics?.drawdownProgress ?? 0
  const remainingLoss = metrics?.remainingLoss ?? 0

  const cardSize = size === 'small' || size === 'small-long' ? 'sm' : 'md'
  const daysUntilPayment = account.nextPaymentDate 
    ? Math.floor((new Date(account.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card
      variant="elevated"
      hover
      clickable={!!onClick}
      size={cardSize}
      className={cn(
        "flex flex-col",
        size === 'small' || size === 'small-long' ? "w-72" : "w-96"
      )}
      onClick={onClick}
    >
      <CardHeader size={cardSize} className="flex-none pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="truncate w-full">
              <CardTitle size={cardSize === 'sm' ? 'sm' : 'md'} className="flex items-center justify-between w-full">
                <span className="truncate">{account.propfirm || t('propFirm.card.unnamedAccount')}</span>
                {daysUntilPayment !== null && (
                  <div className={cn(
                    "shrink-0 ml-2 text-xs font-medium",
                    daysUntilPayment < 5 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'
                  )}>
                    {daysUntilPayment}{t('propFirm.card.daysBeforeNextPayment')}
                  </div>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {account.number}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent size={cardSize} className={cn(
        "flex-1 space-y-3",
        size === 'small' || size === 'small-long' ? "space-y-2" : "space-y-3"
      )}>
        <div className="flex justify-between items-baseline pb-2 border-b">
          <span className="text-sm text-muted-foreground">{t('propFirm.card.balance')}</span>
          <span className="text-lg font-semibold">${currentBalance.toFixed(2)}</span>
        </div>

        {isConfigured ? (
          <div className="space-y-3">
            {/* Trade Progress Chart - only show for larger sizes */}
            {(size === 'large' || size === 'extra-large') && account.payouts && (
              <TradeProgressChart account={account} />
            )}

            {/* Profit Target Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('propFirm.card.remainingToTarget')}</span>
                <span className="font-medium">${remainingToTarget.toFixed(2)}</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                indicatorClassName={cn(
                  "transition-all duration-300",
                  "bg-[hsl(var(--chart-6))]",
                  progress <= 20 ? "opacity-20" :
                    progress <= 40 ? "opacity-40" :
                      progress <= 60 ? "opacity-60" :
                        progress <= 80 ? "opacity-80" :
                          "opacity-100"
                )}
              />
            </div>

            {/* Drawdown Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('propFirm.card.drawdown')}</span>
                <span className={cn(
                  "font-medium",
                  remainingLoss > account.drawdownThreshold * 0.5 ? "text-success" :
                    remainingLoss > account.drawdownThreshold * 0.2 ? "text-warning" : "text-destructive"
                )}>
                  {remainingLoss > 0
                    ? t('propFirm.card.remainingLoss', { amount: remainingLoss.toFixed(2) })
                    : t('propFirm.card.drawdownBreached')}
                </span>
              </div>
              <Progress
                value={drawdownProgress}
                className="h-2"
                indicatorClassName={cn(
                  "transition-all duration-300",
                  "bg-destructive",
                  drawdownProgress <= 20 ? "opacity-20" :
                    drawdownProgress <= 40 ? "opacity-40" :
                      drawdownProgress <= 60 ? "opacity-60" :
                        drawdownProgress <= 80 ? "opacity-80" :
                          "opacity-100"
                )}
              />
            </div>

            {/* Consistency Section - only show for larger sizes */}
            {metrics && (size === 'large' || size === 'extra-large') && (
              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t('propFirm.card.consistency')}</span>
                  <span className={cn(
                    "font-medium",
                    !metrics.hasProfitableData ? "text-muted-foreground italic" :
                      (metrics.isConsistent || account.consistencyPercentage === 100) ? "text-success" : "text-destructive"
                  )}>
                    {!metrics.hasProfitableData ? t('propFirm.status.unprofitable') :
                      (metrics.isConsistent || account.consistencyPercentage === 100) ? t('propFirm.status.consistent') : t('propFirm.status.inconsistent')}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('propFirm.card.maxAllowedDailyProfit')}</span>
                    <span>${metrics.maxAllowedDailyProfit?.toFixed(2) || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('propFirm.card.highestDailyProfit')}</span>
                    <span>${metrics.highestProfitDay?.toFixed(2) || '-'}</span>
                  </div>
                  
                  {/* Trading Days Section */}
                  <div className="flex justify-between">
                    <span>{t('propFirm.card.tradingDays')}</span>
                    <span className={cn(
                      "font-medium",
                      metrics.validTradingDays === metrics.totalTradingDays ? "text-success" : "text-warning"
                    )}>
                      {metrics.validTradingDays}/{metrics.totalTradingDays}
                      {account.minPnlToCountAsDay && account.minPnlToCountAsDay > 0 && (
                        <span className="ml-1 text-xs opacity-75">
                          (≥${account.minPnlToCountAsDay})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center pt-4 text-sm">
            {t('propFirm.card.needsConfiguration')}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 