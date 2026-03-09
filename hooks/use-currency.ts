// Client-only currency detection used by pricing/checkout entry points.
// Kept intentionally simple and side-effect free (no network calls).
'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { useCurrentLocale } from '@/locales/client'

export type Currency = 'USD' | 'EUR'

// Handles special case for French overseas territories (DOM/TOM) that use EUR currency
// but must be billed in USD due to Stripe pricing configuration limitations.
// Note: This app currently uses Whop, but we keep the same heuristic for consistency.
export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [symbol, setSymbol] = useState('$')
  const locale = useCurrentLocale()

  const detectCurrency = useCallback(() => {
    const eurozoneCountries = [
      'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
      'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'CH',
      // French overseas territories
      'GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF', 'NC', 'PF', 'WF', 'TF',
    ]

    const setCurrencyFromCountry = (countryCode: string) => {
      const upper = countryCode.toUpperCase()
      startTransition(() => {
        if (eurozoneCountries.includes(upper)) {
          setCurrency('EUR')
          setSymbol('€')
        } else {
          setCurrency('USD')
          setSymbol('$')
        }
      })
      return true
    }

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const countryFromCookie = getCookie('user-country')
    if (countryFromCookie) {
      setCurrencyFromCountry(countryFromCookie)
      return
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const isEuropeanTimezone =
      timezone.startsWith('Europe/') ||
      ['Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Brussels', 'Vienna'].some((city) =>
        timezone.includes(city),
      )

    const isEuropeanLocale = /^(fr|de|es|it|nl|pt|el|fi|et|lv|lt|sl|sk|mt|cy)-/.test(locale)

    startTransition(() => {
      if (isEuropeanTimezone || isEuropeanLocale) {
        setCurrency('EUR')
        setSymbol('€')
      } else {
        setCurrency('USD')
        setSymbol('$')
      }
    })
  }, [locale])

  useEffect(() => {
    detectCurrency()
  }, [detectCurrency])

  return { currency, symbol }
}

