'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'

export interface SubscriptionInfo {
  isActive: boolean
  plan: string | null
  status: string
  endDate: Date | null
  trialEndsAt: Date | null
  cancelAtPeriodEnd?: boolean
  canAccessFeature: (feature: string) => boolean
  daysUntilExpiry: number
  isInGracePeriod: boolean
  isTrial: boolean
}

interface FeatureAccessConfig {
  [key: string]: string[]
}

const FEATURE_ACCESS: FeatureAccessConfig = {
  FREE: ['basic_dashboard', 'limited_accounts', 'community_access'],
  MONTHLY: ['basic_dashboard', 'unlimited_accounts', 'priority_support', 'api_access'],
  QUARTERLY: ['basic_dashboard', 'unlimited_accounts', 'priority_support', 'api_access', 'advanced_analytics'],
  YEARLY: ['basic_dashboard', 'unlimited_accounts', 'priority_support', 'api_access', 'advanced_analytics', 'custom_integrations'],
  LIFETIME: ['all_features'],
}

const GRACE_PERIOD_DAYS = 7

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true
    let channel: any = null

    async function fetchSubscription() {
      try {
        if (mounted) setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || !user.email) {
          if (mounted) {
            setSubscription(null)
            setLoading(false)
          }
          return
        }

        // Setup real-time listener once we have the user
        if (!channel && mounted) {
          channel = supabase
            .channel('subscription-changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'Subscription',
                filter: `userId=eq.${user.id}`,
              },
              () => {
                fetchSubscription()
              }
            )
            .subscribe()
        }

        const response = await fetch('/api/subscription/details', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch subscription details')
        }

        const data = await response.json()

        if (mounted) {
          const now = new Date()
          const endDate = data.endDate ? new Date(data.endDate) : null
          const trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null

          const daysUntilExpiry = endDate
            ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0

          const isInGracePeriod = Boolean(
            endDate && daysUntilExpiry >= -GRACE_PERIOD_DAYS && daysUntilExpiry < 0
          )

          const isTrial = data.status === 'TRIAL' && trialEndsAt && trialEndsAt > now

          const plan = (data.plan || 'FREE').toUpperCase() as keyof typeof FEATURE_ACCESS

          setSubscription({
            isActive: data.isActive || false,
            plan: data.plan || 'FREE',
            status: data.status,
            endDate,
            trialEndsAt,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
            canAccessFeature: (feature: string) => {
              if (plan === 'LIFETIME') return true
              const allowedFeatures = FEATURE_ACCESS[plan] || []
              return allowedFeatures.includes(feature) || allowedFeatures.includes('all_features')
            },
            daysUntilExpiry,
            isInGracePeriod,
            isTrial: Boolean(isTrial),
          })
        }
      } catch (err) {
        console.error('[useSubscription] Failed to fetch subscription:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load subscription')
          setSubscription(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSubscription()

    return () => {
      mounted = false
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [supabase])

  const requiresUpgrade = (feature: string): boolean => {
    if (!subscription) return false
    return !subscription.canAccessFeature(feature)
  }

  const showUpgradeModal = (feature: string): boolean => {
    return requiresUpgrade(feature)
  }

  return {
    subscription,
    loading,
    error,
    requiresUpgrade,
    showUpgradeModal,
  }
}

export function useSubscriptionGuard(feature: string) {
  const { subscription, loading } = useSubscription()
  const [showGuard, setShowGuard] = useState(false)

  useEffect(() => {
    if (!loading && subscription) {
      const canAccess = subscription.canAccessFeature(feature)
      setShowGuard(!canAccess && subscription.isActive)
    }
  }, [subscription, loading, feature])

  const Guard = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!subscription) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please sign in to access this feature</p>
        </div>
      )
    }

    if (!subscription.isActive) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">This feature requires an active subscription</p>
          <a href="/pricing" className="text-primary hover:underline">
            View Pricing
          </a>
        </div>
      )
    }

    if (showGuard) {
      return (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-muted-foreground mb-4">
            This feature is available on higher-tier plans
          </p>
          <a href="/pricing" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Upgrade Your Plan
          </a>
        </div>
      )
    }

    return <>{children}</>
  }

  return {
    Guard,
    canAccess: subscription?.canAccessFeature(feature) ?? false,
    isLoading: loading,
  }
}

export function useTrialStatus() {
  const { subscription, loading } = useSubscription()

  const trialDaysRemaining = subscription?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0

  const trialExpired =
    subscription?.isTrial === true && trialDaysRemaining === 0

  const trialEndingSoon = subscription?.isTrial === true && trialDaysRemaining <= 3 && trialDaysRemaining > 0

  return {
    isTrial: subscription?.isTrial ?? false,
    trialDaysRemaining,
    trialExpired,
    trialEndingSoon,
    trialEndDate: subscription?.trialEndsAt,
    loading,
  }
}

export function useSubscriptionExpiry() {
  const { subscription } = useSubscription()

  const daysRemaining = subscription?.daysUntilExpiry ?? 0
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
  const isExpired = daysRemaining <= 0 && subscription?.isActive === false
  const inGracePeriod = subscription?.isInGracePeriod ?? false

  return {
    daysRemaining,
    isExpiringSoon,
    isExpired,
    inGracePeriod,
    expiryDate: subscription?.endDate,
  }
}
