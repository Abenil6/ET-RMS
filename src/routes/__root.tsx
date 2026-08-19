import {
  Outlet,
  createRootRoute,
  Link,
  useLocation,
  useNavigate,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthProvider, useAuth } from '../context/auth'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../apis/queryClient'
import logo from '../assets/Ethio-Tele.jpeg'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getAvatarUrl } from '#/lib/avatars'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

import '../styles.css'

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold text-text-dark">404</h1>
      <p className="mt-2 text-lg text-text-secondary">Page not found</p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-primary-green px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-green/90"
      >
        Go Home
      </Link>
    </div>
  )
}

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'icon', href: logo },
    ],
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'NetCare - Internet Support Ticket System',
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/tickets') || 
                      location.pathname.startsWith('/appointments') ||
                      location.pathname.startsWith('/profile') ||
                      location.pathname.startsWith('/report') ||
                      location.pathname.startsWith('/queue') ||
                      location.pathname.startsWith('/technicians') ||
                      location.pathname.startsWith('/admin')

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
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
          </AuthProvider>
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}

function Nav() {
  const { user, loading, logout } = useAuth()
  const { pathname } = useLocation()
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
      <Link to="/" className="flex items-center gap-1">
        <img src={logo} alt="NetCare logo" className="h-16 w-30 " />
        <span className="text-lg font-extrabold text-text-dark">NetCare</span>
      </Link>

      {!loading && !user && !isAuthPage && (
        <div className="flex items-center gap-2 sm:gap-3">
          <NavLink to="/" active={pathname === '/'}>
            Home
          </NavLink>
          <a
            href="/#features"
            className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg hover:text-text-dark"
          >
            Features
          </a>
          <NavLink to="/login" variant="ghost" active={pathname === '/login'}>
            Login
          </NavLink>
          <NavLink
            to="/register"
            variant="solid"
            active={pathname === '/register'}
          >
            Sign Up
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
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setLogoutConfirmOpen(true)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10"
                  >
                    <LogOut size={16} />
                    Log Out
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
      title="Log out?"
      description="Are you sure you want to log out of your account?"
      confirmLabel={logoutLoading ? 'Logging out...' : 'Log Out'}
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
  return (
    <footer className="border-t border-border bg-card px-6 py-8 text-center text-sm text-text-secondary sm:px-8">
      <p>© {new Date().getFullYear()} Ethio Telecom. All rights reserved.</p>
    </footer>
  )
}
