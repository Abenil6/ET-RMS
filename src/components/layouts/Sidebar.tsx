import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import {
  Home,
  FileText,
  Ticket,
  Wrench,
  User,
  Users,
  ScrollText,
  Calendar,
} from 'lucide-react'

interface SidebarLinkProps {
  to: string
  icon: LucideIcon
  label: string
}

function SidebarLink({ to, icon: Icon, label }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary font-medium hover:bg-bg hover:text-text-dark text-left transition-colors [&.active]:bg-primary-green/10 [&.active]:text-primary-green"
      activeProps={{ className: 'bg-primary-green/10 text-primary-green' }}
    >
      <Icon size={18} />
      {label}
    </Link>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

interface SidebarNavProps {
  role: 'CUSTOMER' | 'ADMIN' | 'TECHNICIAN'
}

export function SidebarNav({ role }: SidebarNavProps) {
  const iconMap: Record<string, LucideIcon> = {
    Home,
    FileText,
    Ticket,
    Calendar,
    User,
    Wrench,
    Users,
    ScrollText,
  }

  const customerLinks = [
    { to: '/dashboard', icon: 'Home', label: 'Overview' },
    { to: '/report', icon: 'FileText', label: 'Report Issue' },
    { to: '/tickets', icon: 'Ticket', label: 'My Tickets' },
    { to: '/appointments', icon: 'Calendar', label: 'Appointments' },
    { to: '/profile', icon: 'User', label: 'My Profile' },
  ]

  const adminLinks = [
    { to: '/dashboard', icon: 'Home', label: 'Overview' },
    { to: '/technicians', icon: 'Wrench', label: 'Technicians' },
    { to: '/tickets', icon: 'Ticket', label: 'Tickets' },
    { to: '/appointments', icon: 'Calendar', label: 'Appointments' },
    { to: '/queue', icon: 'FileText', label: 'Queue' },
    { to: '/admin/users', icon: 'Users', label: 'Users' },
    { to: '/admin/audit', icon: 'ScrollText', label: 'Audit Log' },
    { to: '/profile', icon: 'User', label: 'My Profile' },
  ]

  const techLinks = [
    { to: '/dashboard', icon: 'Home', label: 'Overview' },
    { to: '/tickets', icon: 'Ticket', label: 'Assigned Tickets' },
    { to: '/profile', icon: 'User', label: 'My Profile' },
  ]

  const links = role === 'ADMIN' ? adminLinks : role === 'TECHNICIAN' ? techLinks : customerLinks

  return (
    <motion.nav
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {links.map((link) => (
        <motion.div key={link.to} variants={itemVariants}>
          <SidebarLink to={link.to} icon={iconMap[link.icon]} label={link.label} />
        </motion.div>
      ))}
    </motion.nav>
  )
}
