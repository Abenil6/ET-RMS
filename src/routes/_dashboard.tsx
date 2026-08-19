import {
  Outlet,
  createFileRoute,
  Link,
  useNavigate,
  redirect,
} from '@tanstack/react-router'
import { useAuth } from '../context/auth'
import { getAvatarUrl } from '#/lib/avatars'
import { getAccessToken } from '@/apis/core'
import ConfirmDialog from '../components/ConfirmDialog'
import { useState } from 'react'
import { LogOut, Bell, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import logo from '../assets/Ethio-Tele.jpeg'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { SidebarNav } from '@/components/layouts/Sidebar'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const {
    notifRef,
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    notifLoading,
    notifError,
    loadNotifications,
    unreadCount,
    markAllAsRead,
    formatNotifTime,
    handleNotificationClick,
  } = useNotifications()

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await logout()
      navigate({ to: '/login' })
    } finally {
      setLogoutLoading(false)
      setLogoutConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div
      className="flex min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.aside
        className="w-56 shrink-0 bg-card border-r border-border p-6 flex flex-col justify-between sticky top-0 h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img
              src={logo}
              alt="NetCare logo"
              className="h-12 w-24 object-contain"
            />
            <span className="text-lg font-extrabold text-text-dark">
              NetCare
            </span>
          </Link>

          <motion.p
            className="text-xxs font-bold text-text-primary uppercase tracking-wide mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Menu
          </motion.p>

          <SidebarNav role={user.role} />
        </div>

        <motion.button
          onClick={() => setLogoutConfirmOpen(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary font-medium hover:bg-bg hover:text-error text-left transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={18} />
          Log Out
        </motion.button>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <motion.header
          className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-end px-8 gap-4 relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="relative" ref={notifRef}>
            <motion.button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full hover:bg-bg text-text-secondary hover:text-text-dark transition-colors"
              aria-label="Notifications"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-error text-[10px] font-bold text-white leading-none min-w-4 text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden origin-top-right"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg/50">
                    <h3 className="text-sm font-bold text-text-dark">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-primary-green hover:underline flex items-center gap-1 font-medium"
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {notifLoading ? (
                      <p className="p-4 text-xs text-center text-text-secondary">
                        Loading...
                      </p>
                    ) : notifError ? (
                      <div className="p-4 text-xs text-center text-error">
                        Failed to load notifications{' '}
                        <button
                          className="underline"
                          onClick={() => loadNotifications()}
                        >
                          Retry
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="p-4 text-xs text-center text-text-secondary">
                        No notifications available.
                      </p>
                    ) : (
                      notifications.map((n, index) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          }}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 text-xs transition-colors cursor-pointer ${
                            !n.read ? 'bg-primary-green/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-text-dark ${!n.read ? 'font-semibold' : ''}`}
                            >
                              {n.message}
                            </p>
                            {!n.read && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 + 0.2 }}
                                className="w-2 h-2 rounded-full bg-primary-green shrink-0 mt-1"
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-text-secondary mt-1.5 block">
                            {formatNotifTime(n.createdAt)}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-full border border-border bg-bg px-2 py-1.5 pr-3 shadow-sm transition-colors hover:bg-card"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green/10 overflow-hidden">
              <img
                src={getAvatarUrl(user.avatarStyle, user.avatarSeed)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-text-dark hidden sm:block">
              {user.name}
            </span>
          </Link>
        </motion.header>

        <motion.main
          className="p-8 flex-1 overflow-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        title="Log out?"
        description="Are you sure you want to log out of your account?"
        confirmLabel={logoutLoading ? 'Logging out...' : 'Log Out'}
      />
    </motion.div>
  )
}
