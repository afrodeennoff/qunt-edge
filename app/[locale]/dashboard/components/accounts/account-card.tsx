'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { TradeProgressChart } from "./trade-progress-chart"
import { Account } from "@/lib/data-types"
import { WidgetSize } from '../../types/dashboard'

interface AccountCardProps {
  account: Account
  onClick?: () => void
  size?: WidgetSize
}

export function AccountCard({ account, onClick, size = 'large' }: AccountCardProps) {
  const t = useI18n()
  const [daysUntilNextPayment, setDaysUntilNextPayment] = useState<number | null>(null)

  useEffect(() => {
    const nextPaymentDate = account.nextPaymentDate
    if (!nextPaymentDate) {
      setDaysUntilNextPayment(null)
      return
    }

    const updateDaysUntilNextPayment = () => {
      const remainingDays = Math.floor(
        (new Date(nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      setDaysUntilNextPayment(remainingDays)
    }

    updateDaysUntilNextPayment()
    const intervalId = setInterval(updateDaysUntilNextPayment, 60 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [account.nextPaymentDate])

  // Extract metrics from account (computed server-side)
  const metrics = account.metrics
  const isConfigured = metrics?.isConfigured ?? false
  const currentBalance = metrics?.currentBalance ?? account.startingBalance ?? 0
  const remainingToTarget = metrics?.remainingToTarget ?? 0
  const progress = metrics?.progress ?? 0
  const drawdownProgress = metrics?.drawdownProgress ?? 0
  const remainingLoss = metrics?.remainingLoss ?? 0
  const drawdownThreshold = Number(account.drawdownThreshold ?? 0)
  const consistencyPercentage = Number(account.consistencyPercentage ?? 0)
  const minPnlToCountAsDay = Number(account.minPnlToCountAsDay ?? 0)

  return (
    <Card
      className={cn(
        "flex flex-col cursor-pointer transition-all duration-300 shadow-xs hover:shadow-xl liquid-panel liquid-panel-hover overflow-hidden",
        size === 'small' || size === 'small-long' ? "w-72" : "w-96"
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "flex-none pb-2",
        size === 'small' || size === 'small-long' ? "p-2" : "p-3"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 w-full">
            <div className="truncate w-full">
              <CardTitle className={cn(
                "truncate flex items-center gap-2 w-full",
                size === 'small' || size === 'small-long' ? "text-xs" : "text-sm"
              )}>

                <div className="flex w-full justify-between min-w-0">
                  <span className="truncate text-white font-bold">{account.propfirm || t('propFirm.card.unnamedAccount')}</span>
                  {
                    account.nextPaymentDate && daysUntilNextPayment !== null && (
                      <div className={cn(
                        "self-center ml-2 shrink-0 font-terminal",
                        size === 'small' || size === 'small-long' ? "text-[10px]" : "text-[10px]",
                        daysUntilNextPayment < 5 ? 'text-white blink' : 'text-white/40'
                      )}>
                        {daysUntilNextPayment}
                        {t('propFirm.card.daysBeforeNextPayment')}
                      </div>
                    )
                  }
                </div>
              </CardTitle>
              <p className={cn(
                "text-white/30 truncate font-mono",
                size === 'small' || size === 'small-long' ? "text-[10px]" : "text-[10px]"
              )}>
                {account.number}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(
        "flex-1 pt-0",
        size === 'small' || size === 'small-long' ? "p-2 space-y-1.5" : "p-3 space-y-2"
      )}>
        <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
          <span className={cn(
            "text-white/40 uppercase tracking-widest font-bold",
            size === 'small' || size === 'small-long' ? "text-[9px]" : "text-[10px]"
          )}>{t('propFirm.card.balance')}</span>
          <span className={cn(
            "font-black truncate ml-2 text-white",
            size === 'small' || size === 'small-long' ? "text-base" : "text-lg"
          )}>${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {isConfigured ? (
          <div className={cn(
            size === 'small' || size === 'small-long' ? "space-y-1.5" : "space-y-2"
          )}>
            {/* Trade Progress Chart - only show for larger sizes */}
            {(size === 'large' || size === 'extra-large') && account.payouts && (
              <TradeProgressChart
                account={account}
              />
            )}

            {/* Profit Target Section */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-tight">
                <span className="text-white/40">{t('propFirm.card.remainingToTarget')}</span>
                <span className="text-white">${remainingToTarget.toLocaleString()}</span>
              </div>
              <Progress
                value={progress}
                className={cn(
                  "bg-white/5",
                  size === 'small' || size === 'small-long' ? "h-1" : "h-1.5"
                )}
                indicatorClassName={cn(
                  "transition-all duration-500 bg-white",
                  progress <= 20 ? "opacity-20 shadow-none" :
                    progress <= 40 ? "opacity-40 shadow-none" :
                      progress <= 60 ? "opacity-60 shadow-none" :
                        progress <= 80 ? "opacity-85 shadow-none" :
                          "opacity-100 shadow-none"
                )}
              />
            </div>

            {/* Drawdown Section */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-tight">
                <span className="text-white/40">{t('propFirm.card.drawdown')}</span>
                <span className={cn(
                  "font-black truncate ml-2",
                  remainingLoss > drawdownThreshold * 0.5 ? "text-white" :
                    remainingLoss > drawdownThreshold * 0.2 ? "text-white/60" : "text-white/30"
                )}>
                  {remainingLoss > 0
                    ? t('propFirm.card.remainingLoss', { amount: remainingLoss.toFixed(2) })
                    : t('propFirm.card.drawdownBreached')}
                </span>
              </div>
              <Progress
                value={drawdownProgress}
                className={cn(
                  "bg-white/5",
                  size === 'small' || size === 'small-long' ? "h-1" : "h-1.5"
                )}
                indicatorClassName={cn(
                  "transition-all duration-500 bg-white/40",
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
              <div className="space-y-1 pt-2 border-t border-white/5 mt-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tight">
                  <span className="text-white/40">{t('propFirm.card.consistency')}</span>
                  <span className={cn(
                    "font-black",
                    !metrics.hasProfitableData ? "text-white/20 italic" :
                      (metrics.isConsistent || consistencyPercentage === 100) ? "text-white" : "text-white/40"
                  )}>
                    {!metrics.hasProfitableData ? t('propFirm.status.unprofitable') :
                      (metrics.isConsistent || consistencyPercentage === 100) ? t('propFirm.status.consistent') : t('propFirm.status.inconsistent')}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-medium text-white/30">
                  <span>{t('propFirm.card.maxAllowedDailyProfit')}</span>
                  <span>${metrics.maxAllowedDailyProfit?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium text-white/30">
                  <span>{t('propFirm.card.highestDailyProfit')}</span>
                  <span>${metrics.highestProfitDay?.toLocaleString() || '-'}</span>
                </div>

                {/* Trading Days Section */}
                {metrics && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight mt-1 pt-1 border-t border-white/[0.03]">
                    <span className="text-white/40">{t('propFirm.card.tradingDays')}</span>
                    <span className={cn(
                      "font-black",
                      metrics.validTradingDays === metrics.totalTradingDays ? "text-white" : "text-white/60"
                    )}>
                      {metrics.validTradingDays}/{metrics.totalTradingDays}
                      {minPnlToCountAsDay > 0 && (
                        <span className="ml-1 text-[9px] opacity-40">
                          (≥${minPnlToCountAsDay})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className={cn(
            "text-white/20 text-center pt-2 font-medium italic",
            size === 'small' || size === 'small-long' ? "text-[10px]" : "text-xs"
          )}>
            {t('propFirm.card.needsConfiguration')}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 
