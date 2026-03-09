export const SUPPORTED_LOCALES = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'pt',
  'vi',
  'hi',
  'ja',
  'zh',
  'yo',
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'
