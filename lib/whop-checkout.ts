export type WhopCheckoutParams = {
  lookupKey: string
  referral?: string | null
  promoCode?: string | null
  locale?: string | null
}

export type WhopTeamCheckoutParams = {
  teamName?: string | null
  locale?: string | null
}

function safeLocale(locale: string | null | undefined): string | undefined {
  if (!locale) return undefined
  const trimmed = locale.trim().toLowerCase()
  // Keep this permissive: app supports multiple locales; avoid blocking unknown ones.
  if (!/^[a-z]{2}(-[a-z]{2})?$/.test(trimmed)) return undefined
  return trimmed
}

export function buildWhopCheckoutUrl(params: WhopCheckoutParams): string {
  const search = new URLSearchParams()
  search.set('lookup_key', params.lookupKey)
  if (params.referral) search.set('referral', params.referral)
  if (params.promoCode) search.set('promo_code', params.promoCode)
  const loc = safeLocale(params.locale)
  if (loc) search.set('locale', loc)
  return `/api/whop/checkout?${search.toString()}`
}

export function buildWhopTeamCheckoutUrl(params: WhopTeamCheckoutParams): string {
  const search = new URLSearchParams()
  if (params.teamName) search.set('teamName', params.teamName)
  const loc = safeLocale(params.locale)
  if (loc) search.set('locale', loc)
  const qs = search.toString()
  return `/api/whop/checkout-team${qs ? `?${qs}` : ''}`
}

