import { useEffect } from 'react'
import { useThemeStore } from '@/features/ui/store/themeStore'

function getResolvedTheme(theme: 'light' | 'dark' | 'system') {
  if (theme !== 'system') return theme

  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: 'light' | 'dark' | 'system') {
  if (typeof document === 'undefined') return

  const resolvedTheme = getResolvedTheme(theme)
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  document.documentElement.dataset.theme = resolvedTheme
}

export function ThemeBootstrap() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    applyTheme(theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function handleSystemThemeChange() {
      applyTheme('system')
    }

    media.addEventListener('change', handleSystemThemeChange)

    return () => {
      media.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme])

  return null
}
