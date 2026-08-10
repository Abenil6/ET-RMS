import {
  Outlet,
  createFileRoute,
  Link,
  useNavigate,
} from '@tanstack/react-router'
import { useAuth } from '../context/auth'
import { api, ApiError } from '../lib/api'
import { getAvatarUrl } from '#/lib/avatars'
import ConfirmDialog from '../components/ConfirmDialog'
import { useEffect, useState, useRef } from 'react'
import {
  Home,
  FileText,
  Ticket,
  Wrench,
  User,
  LogOut,
  Bell,
  Calendar as CalendarIcon,
  CheckCheck,
  Users,
  ScrollText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { Notification as ApiNotification } from '../lib/types'
import logo from '../assets/Ethio-Tele.jpeg'

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
})

export type NotificationItem = ApiNotification

// Stagger animation variants for sidebar links
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifError, setNotifError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // initial badge
    loadUnreadCount()

    // optional polling every 30s (good for notifications)
    const t = setInterval(loadUnreadCount, 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (isNotifOpen) {
      loadNotifications()
    }
  }, [isNotifOpen])

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [loading, user, navigate])

  async function loadUnreadCount() {
    if (!user) {
      setUnreadCount(0)
      return
    }
    try {
      const unread = await api.notifications.getAll(true) // ?unread=1
      setUnreadCount(unread.length)
    } catch {
      // don’t block UI if notifications fail
      setUnreadCount(0)
    }
  }

  async function loadNotifications() {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      setNotifLoading(true)
      setNotifError(null)
      const all = await api.notifications.getAll(false)
      setNotifications(all)
      setUnreadCount(all.filter((n) => !n.read).length)
    } catch (err) {
      setNotifError(
        err instanceof ApiError ? err.message : 'Failed to load notifications',
      )
    } finally {
      setNotifLoading(false)
    }
  }

  async function markAsRead(id: string) {
    // optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    setUnreadCount((c) => Math.max(0, c - 1))

    try {
      await api.notifications.markAsRead(id)
    } catch (err) {
      // if it fails, refresh from server
      await loadNotifications()
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.read)
    if (unread.length === 0) return

    // optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)

    try {
      await Promise.all(unread.map((n) => api.notifications.markAsRead(n.id)))
    } catch {
      await loadNotifications()
    }
  }

  function formatNotifTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString('en-ET', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false)
      }
    }

    loadNotifications()

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

          <motion.nav
            className="flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {user.role === 'CUSTOMER' && (
              <>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/dashboard" icon={Home} label="Overview" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink
                    to="/report"
                    icon={FileText}
                    label="Report Issue"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/tickets" icon={Ticket} label="My Tickets" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink
                    to="/appointments"
                    icon={CalendarIcon}
                    label="Appointments"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/profile" icon={User} label="My Profile" />
                </motion.div>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/dashboard" icon={Home} label="Overview" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink
                    to="/technicians"
                    icon={Wrench}
                    label="Technicians"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/tickets" icon={Ticket} label="Tickets" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink
                    to="/appointments"
                    icon={CalendarIcon}
                    label="Appointments"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/queue" icon={FileText} label="Queue" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/admin/users" icon={Users} label="Users" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink
                    to="/admin/audit"
                    icon={ScrollText}
                    label="Audit Log"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/profile" icon={User} label="My Profile" />
                </motion.div>
              </>
            )}

            {user.role === 'TECHNICIAN' && (
              <>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/dashboard" icon={Home} label="Overview" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink
                    to="/tickets"
                    icon={Ticket}
                    label="Assigned Tickets"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <SidebarLink to="/profile" icon={User} label="My Profile" />
                </motion.div>
              </>
            )}
          </motion.nav>
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
        {/* Header with fade/slight slide down */}
        <motion.header
          className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-end px-8 gap-4 relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Notifications Dropdown */}
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
                        onClick={markAllAsRead}
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
                        {notifError}{' '}
                        <button
                          className="underline"
                          onClick={loadNotifications}
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
                          onClick={async () => {
                            if (!n.read) await markAsRead(n.id)
                            if (n.ticketId) {
                              navigate({
                                to: '/tickets/$ticketId',
                                params: { ticketId: n.ticketId },
                              })
                              setIsNotifOpen(false)
                            }
                          }}
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

          {/* User Avatar */}
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

        {/* Main content with smooth entrance */}
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
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        variant="danger"
        loading={logoutLoading}
      />
    </motion.div>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ComponentType<{ size?: number }>
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary font-medium hover:bg-bg hover:text-text-dark transition-colors"
      activeProps={{ className: 'bg-primary-green/10 text-primary-green' }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  )
}
