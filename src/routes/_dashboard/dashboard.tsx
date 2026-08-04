import { createFileRoute, Link } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { useAuth } from '../../context/auth'
import { api } from '../../lib/api'
import { useFetch } from '../../lib/useFetch'
import { STATUS_CONFIG } from '../../data/tickets'
import type { Ticket } from '../../lib/types'
import { AlertCircle, UserCheck, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  if (user.role === 'ADMIN') return <AdminOverview />
  if (user.role === 'TECHNICIAN') return <TechnicianOverview />
  return <CustomerOverview />
}

function AdminOverview() {
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  const list = tickets ?? []
  const open = list.filter((t) => t.status === 'OPEN').length
  const assigned = list.filter((t) => t.technicianId !== null).length
  const resolved = list.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-dark mb-1">Admin Overview</h1>
        <p className="text-text-secondary mb-8">System-wide ticket status.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={AlertCircle} label="Open Tickets" value={String(open)} color="warning" delay={0.1} />
        <StatCard icon={UserCheck} label="Assigned" value={String(assigned)} color="primary-blue" delay={0.2} />
        <StatCard icon={CheckCircle2} label="Resolved" value={String(resolved)} color="success" delay={0.3} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-dark">Recent Tickets</h2>
        <Link to="/tickets" className="text-sm font-semibold text-primary-green hover:underline">
          View all →
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-5 text-text-secondary text-sm">No tickets yet.</p>
        ) : (
          list.slice(0, 5).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <TicketRow ticket={t} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function TechnicianOverview() {
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  const list = tickets ?? []

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-dark mb-1">Assigned to You</h1>
        <p className="text-text-secondary mb-8">Tickets currently on your queue.</p>
      </motion.div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-5 text-text-secondary text-sm">No tickets assigned yet.</p>
        ) : (
          list.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to="/tickets/$ticketId"
                params={{ ticketId: t.id }}
                className="flex items-center justify-between px-5 py-4 hover:bg-bg transition"
              >
                <div>
                  <p className="font-semibold text-text-dark">
                    {t.ticketNumber} — {t.subject}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {t.customer.name} · {t.customer.email}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[t.status].bg
                    } ${STATUS_CONFIG[t.status].color}`}
                >
                  {STATUS_CONFIG[t.status].label}
                </span>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function CustomerOverview() {
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  const list = tickets ?? []
  const open = list.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-dark mb-1">My Tickets</h1>
        <p className="text-text-secondary mb-8">Track the status of your service requests.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={AlertCircle} label="Open/Assigned" value={String(open)} color="warning" delay={0.1} />
        <StatCard icon={CheckCircle2} label="Resolved" value={String(list.filter((t) => t.status === 'RESOLVED').length)} color="success" delay={0.2} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-dark">Recent Tickets</h2>
        <Link to="/tickets" className="text-sm font-semibold text-primary-green hover:underline">
          View all →
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-5 text-text-secondary text-sm">No tickets yet. Click "Create Ticket" to submit a new request.</p>
        ) : (
          list.slice(0, 5).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <TicketRow ticket={t} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  color: 'primary-green' | 'warning' | 'success' | 'primary-blue'
  delay: number
}

function StatCard({ icon: Icon, label, value, color, delay }: StatCardProps) {
  const { bg, text } = {
    'primary-green': { bg: 'bg-primary-green/10', text: 'text-primary-green' },
    'primary-blue': { bg: 'bg-primary-blue/10', text: 'text-primary-blue' },
    'warning': { bg: 'bg-warning/10', text: 'text-warning' },
    'success': { bg: 'bg-success/10', text: 'text-success' },
  }[color]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
        <Icon className={`w-5 h-5 ${text}`} />
      </div>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-text-dark mt-1">{value}</p>
    </motion.div>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to="/tickets/$ticketId"
      params={{ ticketId: ticket.id }}
      className="flex items-center justify-between px-5 py-4 hover:bg-bg transition"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-text-dark">{ticket.ticketNumber}</p>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].color}`}>
            {STATUS_CONFIG[ticket.status].label}
          </span>
        </div>
        <p className="font-semibold text-text-dark">{ticket.subject}</p>
        <p className="text-xs text-text-secondary">
          {ticket.customer.name} · {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-text-dark">{ticket.serviceNumber}</p>
        <p className="text-xs text-text-secondary">Service No.</p>
      </div>
    </Link>
  )
}