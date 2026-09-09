// src/hooks/useLanguage.ts

import { useEffect } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'

import i18n from '@/lib/i18n'

import {
  DEFAULT_LANGUAGE,
  RTL_LANGUAGES,
  type LanguageCode,
  LANGUAGES,
} from '@/lib/i18n-constants'

export function useLanguage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract language from the URL path
  // Example: /am/dashboard -> "am"
  const pathParts = location.pathname.split('/').filter(Boolean)
  const pathLang = pathParts[0]

  const validLanguageCodes = LANGUAGES.map((language) => language.code)

  const langFromPath = validLanguageCodes.includes(
    pathLang as LanguageCode,
  )
    ? (pathLang as LanguageCode)
    : undefined

  // Path is now the single source of truth for the language.
  const language = langFromPath ?? DEFAULT_LANGUAGE

  // Keep i18n and the document synchronized with the URL language.
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
    // Change i18n immediately
    void i18n.changeLanguage(nextLanguage)

    // Current pathname
    let newPath = location.pathname

    // Remove existing language prefix
    if (langFromPath) {
      const pathWithoutLanguage = pathParts.slice(1).join('/')

      newPath = pathWithoutLanguage
        ? `/${pathWithoutLanguage}`
        : '/'
    }

    // Add the new language prefix
    newPath = `/${nextLanguage}${newPath}`

    // Prevent accidental double slashes
    newPath = newPath.replace(/\/+/g, '/')

    // Navigate without search params.
    // Language is handled entirely by the URL path.
    void navigate({
      to: newPath as any,
    })
  }

  return {
    language,
    setLanguage,
  }
}