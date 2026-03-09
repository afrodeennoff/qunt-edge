"use client"
import { createI18nClient } from 'next-international/client'

export const { useI18n, useScopedI18n, I18nProviderClient, useChangeLocale, useCurrentLocale } = createI18nClient({
  en: () => import('./en'),
  fr: () => import('./fr'),
  hi: () => import('./hi'),
  ja: () => import('./ja'),
  es: () => import('./es'),
  it: () => import('./it'),
  de: () => import('./en'),
  pt: () => import('./en'),
  vi: () => import('./en'),
  zh: () => import('./en'),
  yo: () => import('./en'),
})
