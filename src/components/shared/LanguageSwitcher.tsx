import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/i18n-constants'
import { useLanguage } from '@/hooks/useLanguage'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  return (
    <div>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        aria-label={t('language.select')}
        className="rounded-full border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-card hover:text-text-dark"
      >
        {LANGUAGES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
