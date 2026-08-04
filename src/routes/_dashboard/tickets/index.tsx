import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, RefreshCw, Filter } from 'lucide-react'
import { useAuth } from '../../../context/auth'
import { api } from '../../../lib/api'
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
} from '../../../data/tickets'
import type { Ticket, TicketStatus } from '../../../lib/types'
import { useQueuePosition } from '../../../lib/useQueuePosition'
import { useFetch } from '../../../lib/useFetch'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_dashboard/tickets/')({
  component: TicketsPage,
})

function TicketsPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL')
  const [refreshing, setRefreshing] = useState(false)
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  async function handleRefresh() {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  if (!user) return null
  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  const list = tickets ?? []

  // Filter by status
  const filteredTickets =
    statusFilter === 'ALL'
      ? list
      : list.filter((t) => t.status === statusFilter)

  const pageTitle =
    user.role === 'CUSTOMER'
      ? 'My Tickets'
      : user.role === 'TECHNICIAN'
        ? 'Assigned Tickets'
        : 'All Tickets'

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-text-secondary mt-1">
              {list.length} ticket{list.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-70"
              title="Refresh tickets"
            >
              <RefreshCw
                className={`w-8 h-8 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>

            {/* New ticket button — customers only */}
            {user.role === 'CUSTOMER' && (
              <Link
                to="/report"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-full hover:bg-primary/90 transition font-bold"
              >
                <Plus className="w-5 h-5 text-black" />
                New Ticket
              </Link>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-text-secondary" />
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              statusFilter === 'ALL'
                ? 'bg-primary text-black'
                : 'bg-gray-100 text-text-secondary '
            }`}
          >
            All ({list.length})
          </button>
          {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((status) => {
            const count = list.filter((t) => t.status === status).length
            if (count === 0) return null
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-primary text-black'
                    : `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color} `
                }`}
              >
                {STATUS_CONFIG[status].label} ({count})
              </button>
            )
          })}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-text-secondary text-lg mb-2">No tickets found</p>
            <p className="text-text-secondary text-sm mb-6">
              {statusFilter !== 'ALL'
                ? `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} tickets`
                : 'You have no tickets yet'}
            </p>
            {user.role === 'CUSTOMER' && statusFilter === 'ALL' && (
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                <Plus className="w-4 h-4" />
                Create your first ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to="/tickets/$ticketId"
                params={{ ticketId: ticket.id }}
                className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    {/* Ticket number + subject */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-text-secondary">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].color}`}
                      >
                        {STATUS_CONFIG[ticket.status].label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 truncate">
                      {ticket.subject}
                    </h3>

                    <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                      {ticket.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {CATEGORY_LABELS[ticket.category] || ticket.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_CONFIG[ticket.priority].bg} ${PRIORITY_CONFIG[ticket.priority].color}`}
                      >
                        {PRIORITY_CONFIG[ticket.priority].label} Priority
                      </span>
                      <span className="text-xs text-text-secondary">
                        Service: {ticket.serviceNumber}
                      </span>
                      {ticket.technician && (
                        <span className="text-xs text-text-secondary">
                          Assigned to: {ticket.technician.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-text-secondary">
                      {new Date(ticket.createdAt).toLocaleDateString('en-ET', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>

                    {/* Queue position for open tickets */}
                    {ticket.status === 'OPEN' && (
                      <QueueBadge ticketId={ticket.id} initial={ticket.queue} />
                    )}

                    {/* Admin: show customer name */}
                    {user.role === 'ADMIN' && (
                      <div className="mt-2 text-xs text-text-secondary">
                        {ticket.customer.name}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function QueueBadge({
  ticketId,
  initial,
}: {
  ticketId: string
  initial?: Ticket['queue']
}) {
  const { queue } = useQueuePosition(ticketId, true, 30000)
  const info = queue ?? initial
  if (!info) return null
  return (
    <div
      className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
      title="Live queue position"
    >
      Queue #{info.position}
      <br />~{info.estimatedWaitMinutes}min wait
    </div>
  )
}
