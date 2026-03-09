export const SUBSCRIPTION_STATUSES = [
  'ACTIVE',
  'CANCELLED',
  'PAST_DUE',
  'PENDING',
  'TRIAL_EXPIRED',
] as const

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

const STATUS_ALIAS_MAP: Record<string, SubscriptionStatus> = {
  ACTIVE: 'ACTIVE',
  TRIAL: 'PENDING',
  TRIALING: 'PENDING',
  PENDING: 'PENDING',
  PAUSED: 'PENDING',
  PAST_DUE: 'PAST_DUE',
  OVERDUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  CANCELED: 'CANCELLED',
  EXPIRED: 'TRIAL_EXPIRED',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
}

export function normalizeSubscriptionStatus(status: string | null | undefined): SubscriptionStatus {
  const normalized = (status || '').trim().toUpperCase()
  return STATUS_ALIAS_MAP[normalized] ?? 'PENDING'
}

export function isActiveSubscriptionStatus(status: string | null | undefined): boolean {
  const normalized = normalizeSubscriptionStatus(status)
  return normalized === 'ACTIVE' || normalized === 'PENDING'
}
