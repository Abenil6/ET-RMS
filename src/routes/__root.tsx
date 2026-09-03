import {
  Outlet,
  createRootRoute,
  Link,
  useLocation,
  useNavigate,
  HeadContent,
  Scripts,
  retainSearchParams,
} from '@tanstack/react-router'
import { z } from 'zod'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../apis/queryClient'
import '../lib/i18n'
import logo from '../assets/Et-logo.png'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getAvatarUrl } from '#/lib/avatars'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { ThemeToggle } from '@/features/ui/components/ThemeToggle'
import { ThemeBootstrap } from '@/features/ui/components/ThemeBootstrap'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'
import { useTranslation } from 'react-i18next'
import '../styles.css'

function NotFoundComponent() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold text-text-dark">404</h1>
      <p className="mt-2 text-lg text-text-secondary">
        {t('navigation.page_not_found')}
      </p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-primary-green px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-green/90"
      >
        {t('navigation.go_home')}
      </Link>
    </div>
  )
}

export const Route = createRootRoute({
  validateSearch: z.object({
    lang: z.enum(['en', 'am', 'ar', 'om']).default('en').catch('en'),
  }),
  search: {
    middlewares: [retainSearchParams(['lang'])],
  },
  head: () => ({
    title: 'NetCare - Internet Support Ticket System',
    links: [{ rel: 'icon', href: logo }],
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    scripts: [
      {
        children: `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'system';
    var resolvedTheme = theme;
    
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.dataset.theme = resolvedTheme;
  } catch (e) {}
})();
        `,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  const { language } = useLanguage()
  const location = useLocation()
  const isDashboard =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/tickets') ||
    location.pathname.startsWith('/appointments') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/report') ||
    location.pathname.startsWith('/queue') ||
    location.pathname.startsWith('/technicians') ||
    location.pathname.startsWith('/admin')

  return (
    <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeBootstrap />
          <AuthBootstrap>
            {!isDashboard && <Nav />}
            <Outlet />
            {!isDashboard && <Footer />}
            <TanStackDevtools
              config={{ position: 'bottom-right' }}
              plugins={[
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </AuthBootstrap>
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}

function Nav() {
  const { t } = useTranslation()
  const { user, loading, logout } = useAuth()
  const { pathname } = useLocation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const isAuthPage = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await logout()
      setMenuOpen(false)
      navigate({ to: '/login' })
    } finally {
      setLogoutLoading(false)
      setLogoutConfirmOpen(false)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-6 py-4 backdrop-blur sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Ethio Telecom NetCare"
            className="h-9 w-auto shrink-0 object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight text-text-dark">
            NetCare
          </span>
        </Link>

        {!loading && !user && !isAuthPage && (
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <NavLink to="/" active={pathname === '/'}>
              {t('navigation.home')}
            </NavLink>
            <a
              href={language !== 'en' ? `/?lang=${language}#features` : '/#features'}
              className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg hover:text-text-dark"
            >
              {t('navigation.features')}
            </a>
            <NavLink to="/login" variant="ghost" active={pathname === '/login'}>
              {t('navigation.login')}
            </NavLink>
            <NavLink
              to="/register"
              variant="solid"
              active={pathname === '/register'}
            >
              {t('navigation.sign_up')}
            </NavLink>
          </div>
        )}

        {!loading && user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-full border border-border bg-bg px-2 py-1.5 pr-3 shadow-sm transition-colors hover:bg-card"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-green/10 text-sm font-extrabold text-primary-green">
                <img
                  src={getAvatarUrl(user.avatarStyle, user.avatarSeed)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden text-sm font-semibold text-text-dark sm:inline">
                {user.name}
              </span>
              <ChevronDown size={16} className="text-text-secondary" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
                >
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-dark transition-colors hover:bg-bg"
                    >
                      <User size={16} />
                      {t('navigation.my_profile')}
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setLogoutConfirmOpen(true)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10"
                    >
                      <LogOut size={16} />
                      {t('navigation.log_out')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {loading && (
          <div className="h-10 w-32 animate-pulse rounded-full bg-bg" />
        )}
      </nav>
      <ConfirmDialog
        open={logoutConfirmOpen}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        title={t('navigation.log_out_confirm_title')}
        description={t('navigation.log_out_confirm_description')}
        confirmLabel={
          logoutLoading ? t('navigation.logging_out') : t('navigation.log_out')
        }
      />
    </>
  )
}

function NavLink({
  to,
  children,
  active,
  variant = 'ghost',
}: {
  to: '/' | '/login' | '/register'
  children: React.ReactNode
  active: boolean
  variant?: 'ghost' | 'solid'
}) {
  const base =
    variant === 'solid'
      ? 'rounded-full bg-primary-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-green/90'
      : 'rounded-full px-4 py-2 text-sm font-semibold transition-colors'
  const inactive =
    variant === 'solid'
      ? ''
      : 'text-text-secondary hover:bg-bg hover:text-text-dark'
  const activeClass =
    variant === 'solid'
      ? 'bg-primary-green text-white'
      : 'bg-primary-green/10 text-primary-green'

  return (
    <Link to={to} className={`${base} ${active ? activeClass : inactive}`}>
      {children}
    </Link>
  )
}

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border bg-card px-6 py-8 text-center text-sm text-text-secondary sm:px-8">
      <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  )
}
