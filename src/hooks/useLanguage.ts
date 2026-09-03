// src/hooks/useLanguage.ts
import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import i18n from '@/lib/i18n'
import {
  DEFAULT_LANGUAGE,
  RTL_LANGUAGES,
  type LanguageCode,
} from '@/lib/i18n-constants'

export function useLanguage() {
  // Pass strict: false so search params can be read globally across any route match (including __root__)
  const search = useSearch({ strict: false })
  const navigate = useNavigate()

  const lang = search.lang as LanguageCode | undefined
  const language = lang ?? DEFAULT_LANGUAGE

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language)
    }
    document.documentElement.lang = language
    document.documentElement.dir = RTL_LANGUAGES.includes(language)
      ? 'rtl'
      : 'ltr'
  }, [language])

  function setLanguage(nextLanguage: LanguageCode) {
    void i18n.changeLanguage(nextLanguage)
    void navigate({
    to: '.',
    search: (previous) => ({
      ...previous,
      lang: nextLanguage,
      }),
    })
  }

  return { language, setLanguage }
}