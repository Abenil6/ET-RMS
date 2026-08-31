import { Monitor, Moon, Sun, ChevronDown } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/features/ui/store/themeStore'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const THEME_OPTIONS: Array<{
  value: ThemeMode
  label: string
  icon: typeof Sun
}> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const currentOption = THEME_OPTIONS.find((opt) => opt.value === theme)
  const CurrentIcon = currentOption?.icon || Sun

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-card hover:text-text-dark"
      >
        <CurrentIcon size={16} />
        <ChevronDown size={14} />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50"
          >
            <div className="p-1">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = theme === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTheme(option.value)
                      setDropdownOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-green/10 text-primary-green'
                        : 'text-text-dark hover:bg-bg'
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
