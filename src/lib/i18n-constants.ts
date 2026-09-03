export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'ar', label: 'العربية' },
  { code: 'om', label: 'Afaan Oromoo' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

export const RTL_LANGUAGES: LanguageCode[] = ['ar']

export const DEFAULT_LANGUAGE: LanguageCode = 'en'