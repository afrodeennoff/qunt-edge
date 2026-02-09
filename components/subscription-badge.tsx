'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { useI18n, useCurrentLocale } from "@/locales/client"
import { useSubscriptionStore } from "@/store/subscription-store"



export function SubscriptionBadge({ className }: { className?: string }) {
  const t = useI18n()
  const locale = useCurrentLocale()
  // Use store data
  const subscription = useSubscriptionStore(state => state.subscription)
  const isLoading = useSubscriptionStore(state => state.isLoading)

  // Compute values directly from subscription data
  const planName = subscription?.plan?.name || 'Free'
  const isLifetime = subscription?.plan?.interval === 'lifetime'
  const isTrialing = subscription?.status === 'trialing'
  const isActive = subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.cancel_at_period_end || subscription?.status === 'canceled'
  
  // Compute dates
  const nextBillingDate = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null
  const trialEndDate = subscription?.trial_end ? new Date(subscription.trial_end * 1000) : null
  
  // Compute days remaining
  const trialDays = (() => {
    if (!subscription?.trial_end) return null
    const today = new Date()
    const trialEnd = new Date(subscription.trial_end * 1000)
    const diffTime = trialEnd.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  })()
  
  const subscriptionDays = (() => {
    if (!subscription?.cancel_at_period_end || !subscription?.current_period_end) return null
    const today = new Date()
    const endDate = new Date(subscription.current_period_end * 1000)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  })()

  // Show loading state only when actually loading
  if (isLoading) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "px-2 py-0.5 text-xs whitespace-nowrap",
          "bg-secondary text-secondary-foreground",
          className
        )}
      >
        {t('pricing.loading')}
      </Badge>
    )
  }

  // If no subscription data after loading, user is on Free plan
  if (!subscription) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "px-2 py-0.5 text-xs whitespace-nowrap",
          "bg-secondary text-secondary-foreground",
          className
        )}
      >
        {t('pricing.free.name')}
      </Badge>
    )
  }

  // Get badge content based on status
  const getBadgeContent = () => {
    // At this point, we know we have subscription data (loading case is handled above)

    // Lifetime: simply show the plan name as active
    if (isLifetime) {
      return { text: planName, variant: 'active' as const, tooltip: undefined as string | undefined }
    }

    if (isTrialing) {
      if (!trialDays) {
        return { text: `${planName} • ${t('billing.status.trialing')}`, variant: 'expired' as const, tooltip: t('billing.status.incomplete_expired') }
      }
      const dateStr = trialEndDate ? format(trialEndDate, 'MMM d') : null
      return { text: `${planName} • ${trialDays}d ${t('calendar.charts.remaining')}`, variant: 'trial' as const, tooltip: dateStr ? t('billing.trialEndsIn', { date: dateStr }) : undefined }
    }

    if (isActive) {
      const next = nextBillingDate ? format(nextBillingDate, 'MMM d') : null
      return { text: `${planName}`, variant: 'active' as const, tooltip: next ? t('billing.dates.nextBilling', { date: next }) : undefined }
    }

    if (isPastDue) {
      return { text: `${planName} • ${t('billing.status.past_due')}`, variant: 'expired' as const, tooltip: t('billing.status.past_due') }
    }

    if (isCanceled) {
      const next = nextBillingDate ? format(nextBillingDate, 'MMM d') : null
      if (!subscriptionDays || subscriptionDays <= 0) {
        return { text: `${planName} • ${t('billing.status.canceled')}`, variant: 'expired' as const, tooltip: t('billing.subscriptionCancelled') }
      }
      return { text: `${planName} • ${t('billing.scheduledToCancel')}`, variant: 'expiring' as const, tooltip: next ? t('billing.dates.nextBilling', { date: next }) : undefined }
    }

    // Handle unknown status - show the plan name with a generic status
    const next = nextBillingDate ? format(nextBillingDate, 'MMM d') : null
    return { text: `${planName}`, variant: 'normal' as const, tooltip: next ? t('billing.dates.nextBilling', { date: next }) : undefined }
  }

  const badge = getBadgeContent()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/dashboard/billing">
            <Badge
              variant="secondary"
              className={cn(
                "px-2 py-0.5 text-xs whitespace-nowrap cursor-help transition-colors",
                badge.variant === 'active' && "bg-primary text-primary-foreground hover:bg-primary/90",
                badge.variant === 'trial' && "bg-blue-500 text-white dark:bg-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500",
                badge.variant === 'expiring' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                badge.variant === 'expired' && "bg-destructive/80 text-destructive-foreground hover:bg-destructive/70",
                badge.variant === 'normal' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                className
              )}
            >
              {badge.text}
            </Badge>
          </Link>
        </TooltipTrigger>
        {badge.tooltip && (
          <TooltipContent>
            <p>{badge.tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
} 