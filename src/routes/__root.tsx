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
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../apis/queryClient'
import logo from '../assets/Ethio-Tele.jpeg'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getAvatarUrl } from '#/lib/avatars'

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
    setMenuOpen(false)
    try {
      await logout()
      navigate({ to: '/login' })
    } catch {
      // Error handled by auth context
    }
  }

  if (loading) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Ethio Telecom" className="h-8 w-auto" />
              <span className="text-xl font-bold text-primary-blue">NetCare</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="/#features" className="text-sm font-medium text-text-secondary hover:text-primary-blue transition-colors">
                Features
              </a>
              <a href="/#pricing" className="text-sm font-medium text-text-secondary hover:text-primary-blue transition-colors">
                Pricing
              </a>
              <a href="/#about" className="text-sm font-medium text-text-secondary hover:text-primary-blue transition-colors">
                About
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-neutral-100 transition-colors"
                >
                  <img
                    src={getAvatarUrl(user.avatarStyle, user.avatarSeed, 32)}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="hidden sm:block">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                    >
                      <a
                        href="/_dashboard/profile"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User className="inline h-4 w-4 mr-2" /> Profile
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {!isAuthPage && (
                  <Link
                    to="/login"
                    className="text-sm font-medium text-text-secondary hover:text-primary-blue transition-colors"
                  >
                    Log in
                  </Link>
                )}
                {!isAuthPage && (
                  <Link
                    to="/register"
                    className="rounded-full bg-primary-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-blue/90 transition-colors"
                  >
                    Get Started
                  </Link>
                )}
              </>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-text-secondary hover:bg-neutral-100"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <img src={logo} alt="Ethio Telecom" className="h-8 w-auto mb-4" />
            <p className="text-text-secondary text-sm max-w-xs">
              NetCare - Your trusted partner for internet support and ticket management.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-dark mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="/#features" className="hover:text-primary-blue">Features</a></li>
              <li><a href="/#pricing" className="hover:text-primary-blue">Pricing</a></li>
              <li><a href="/#docs" className="hover:text-primary-blue">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-dark mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="/#about" className="hover:text-primary-blue">About</a></li>
              <li><a href="/#blog" className="hover:text-primary-blue">Blog</a></li>
              <li><a href="/#contact" className="hover:text-primary-blue">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8 text-center text-sm text-text-secondary">
          © {new Date().getFullYear()} Ethio Telecom. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
