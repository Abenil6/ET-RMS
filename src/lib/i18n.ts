import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, LANGUAGES } from './i18n-constants'

import en from '../locales/en/translation.json'
import am from '../locales/am/translation.json'
import ar from '../locales/ar/translation.json'
import om from '../locales/om/translation.json'

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES.map((l) => l.code),
    ns: ['translation'],
    defaultNS: 'translation',
    resources: {
      en: { translation: en },
      am: { translation: am },
      ar: { translation: ar },
      om: { translation: om },
    },
    interpolation: {
      escapeValue: false,
    },
  })
}

export default i18n