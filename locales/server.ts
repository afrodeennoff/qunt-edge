import { createI18nServer } from 'next-international/server'

export const {
  getI18n,
  getScopedI18n,
  getCurrentLocale,
  getStaticParams,
} = createI18nServer({
  en: () => import('./en'),
  fr: () => import('./fr'),
  hi: () => import('./hi'),
  ja: () => import('./ja'),
  es: () => import('./es'),
  it: () => import('./it'),
  // Fallbacks for supported middleware locales that lack files
  de: () => import('./en'),
  pt: () => import('./en'),
  vi: () => import('./en'),
  zh: () => import('./en'),
  yo: () => import('./en'),
})