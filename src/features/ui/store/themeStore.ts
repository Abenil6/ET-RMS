import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

type ThemeStore = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const THEME_STORAGE_KEY = 'theme'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (
    savedTheme === 'light' ||
    savedTheme === 'dark' ||
    savedTheme === 'system'
  ) {
    return savedTheme
  }

  return 'system'
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }

    set({ theme })
  },
}))