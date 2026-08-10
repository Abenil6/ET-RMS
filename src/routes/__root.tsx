import {
  Outlet,
  createRootRoute,
  Link,
  useLocation,
  useNavigate,
  useMatches,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthProvider, useAuth } from '../context/auth'
import logo from '../assets/Ethio-Tele.jpeg'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getAvatarUrl } from '#/lib/avatars'
import * as React from 'react'

// Import CSS - Vite/TanStack will handle this properly
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
  const matches = useMatches()
  const isDashboard = matches.some((match) => match.routeId === '/_dashboard')

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
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
    await logout()
    setMenuOpen(false)
    navigate({ to: '/login' })
  }

  return (
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
            Get Started
          </NavLink>
        </div>
      )}

      {!loading && user && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full border border-border bg-bg px-2 py-2 pr-3 text-left shadow-sm transition-colors hover:bg-card"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-green/10 text-sm font-extrabold text-primary-green">
              <img
                src={getAvatarUrl(user.avatarStyle, user.avatarSeed)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-text-dark">{user.name}</p>
              <p className="text-xs capitalize text-text-secondary">
                {user.role}
              </p>
            </div>
            <motion.div
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-text-secondary" />
            </motion.div>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              >
                <motion.div
                  className="border-b border-border px-4 py-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <p className="text-sm font-bold text-text-dark">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </motion.div>
                <div className="p-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-dark transition-colors hover:bg-bg"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User size={16} className="text-primary-green" />
                      My Profile
                    </Link>
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  >
                    <LogOut size={16} />
                    Log Out
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
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
    <footer className="px-8 py-10 text-center text-text-secondary border-t border-border mt-10">
      <p className="font-bold text-text-dark mb-2">NetCare</p>
      <p className="text-sm mb-4">Internet Support Ticket System</p>
      <div className="flex justify-center gap-6 text-sm mb-4">
        <Link to="/" className="hover:text-text-dark">
          Home
        </Link>
        <a href="#features" className="hover:text-text-dark">
          Features
        </a>
        <a href="#" className="hover:text-text-dark">
          Contact
        </a>
      </div>
      <p className="text-xs">© 2026</p>
    </footer>
  )
}
