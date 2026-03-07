'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { useData } from "@/context/data-provider"
import { SharedWidgetCanvas } from "./shared-widget-canvas"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { Loader2, ChevronDown } from "lucide-react"
import { useState } from "react"
import { LanguageSelector } from "@/components/ui/language-selector"

type I18nFn = ReturnType<typeof useI18n>

// Create a client component for the accounts selection
function AccountsSelector({ accounts }: { accounts: string[] }) {
  const { accountNumbers, setAccountNumbers } = useData()
  const t = useI18n()
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleAccounts = isExpanded ? accounts : accounts.slice(0, 2)
  const remainingAccounts = accounts.length - 2

  const toggleAccount = (account: string) => {
    if (accountNumbers.includes(account)) {
      setAccountNumbers(accountNumbers.filter((a: string) => a !== account))
    } else {
      setAccountNumbers([...accountNumbers, account])
    }
  }

  const toggleAll = () => {
    if (accountNumbers.length === accounts.length) {
      setAccountNumbers([])
    } else {
      setAccountNumbers([...accounts])
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-0 mb-2">
        <p className="text-sm font-medium">{t('shared.tradingAccounts')}</p>
        <div className="flex flex-wrap items-center gap-1.5 w-full xs:w-auto justify-end">
          {accounts.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs gap-1 min-w-0"
            >
              {isExpanded 
                ? t('shared.showLessAccounts')
                : t('shared.showMoreAccounts', { count: remainingAccounts })}
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform shrink-0",
                isExpanded ? "rotate-180" : ""
              )} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleAll}
            className="h-7 text-xs whitespace-nowrap min-w-0"
          >
            {accountNumbers.length === accounts.length ? t('shared.deselectAll') : t('shared.selectAll')}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 xs:gap-2">
        {visibleAccounts.map((account) => (
          <button
            key={account}
            onClick={() => toggleAccount(account)}
            className={cn(
              "flex items-center p-1.5 xs:p-2 rounded-md border transition-colors hover:bg-muted/50",
              accountNumbers.includes(account) 
                ? "bg-primary/10 border-primary/50" 
                : "bg-background border-border"
            )}
          >
            <div className={cn(
              "h-2 w-2 rounded-full mr-1.5 xs:mr-2 shrink-0",
              accountNumbers.includes(account) 
                ? "bg-primary" 
                : "bg-muted-foreground/30"
            )} />
            <span className="text-xs xs:text-sm font-medium truncate" title={account}>
              {account}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TopBanner({ t }: { t: I18nFn }) {
  const locale = useCurrentLocale()
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-4 sm:px-6">
        <div className="flex min-h-[66px] items-center rounded-full border border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.62)] px-3 backdrop-blur-xl sm:px-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface-muted)/0.85)]">
              <Logo className="h-4.5 w-4.5 fill-[hsl(var(--mk-text))]" />
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <h1 className="text-sm font-semibold tracking-tight [font-family:var(--font-poppins)]">Qunt Edge</h1>
              <p className="text-xs text-[hsl(var(--mk-text-muted))]">{t('shared.tagline')}</p>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSelector languages={languages} />
            <Link href={`/${locale}/authentication`}>
              <Button size="sm" className="h-10 rounded-full bg-[hsl(var(--brand-primary))] px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-primary)/0.9)]">
                {t('shared.createAccount')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function SharedPageClient() {
  const t = useI18n()
  const { isLoading, sharedParams } = useData()

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBanner t={t} />
        <div className="w-full mx-auto flex-1 flex items-center justify-center pt-28 sm:pt-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('shared.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!sharedParams) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBanner t={t} />
        <div className="w-full mx-auto flex-1 flex items-center justify-center p-4 pt-28 sm:pt-32">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>{t('shared.notFound')}</CardTitle>
              <CardDescription>
                {t('shared.notFoundDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  const dateRange = sharedParams.dateRange as { from: Date; to: Date }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBanner t={t} />
      <div className="container-fluid flex-1 pt-28 sm:pt-32">
        <main className="w-full py-6 lg:py-8">
          <Card className="mb-6 w-full">
            <CardHeader className="space-y-3">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-xl sm:text-2xl">
                  {sharedParams.title || t('shared.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {sharedParams.description || t('shared.description')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="p-4 border-none shadow-none bg-muted/50">
                  <p className="text-sm font-medium mb-1">{t('shared.sharedOn')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(sharedParams.createdAt || new Date()), "PPP")}
                  </p>
                </Card>
                <Card className="p-4 border-none shadow-none bg-muted/50">
                  <p className="text-sm font-medium mb-1">
                    {dateRange.to ? t('shared.period') : t('shared.since')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dateRange.to ? (
                      <>
                        {format(new Date(dateRange.from), "PPP")}
                        {" - "}
                        {format(new Date(dateRange.to), "PPP")}
                      </>
                    ) : (
                      format(new Date(dateRange.from), "PPP")
                    )}
                  </p>
                </Card>
              </div>
              
              <Card className="p-4 border-none shadow-none bg-muted/50">
                <AccountsSelector accounts={sharedParams.accountNumbers} />
              </Card>
            </CardContent>
          </Card>

          <SharedWidgetCanvas />
        </main>
      </div>
    </div>
  )
} 
