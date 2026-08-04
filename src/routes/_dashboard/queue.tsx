import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/auth'
import { api, ApiError } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'
import { STATUS_CONFIG } from '../../data/tickets'
import type { TicketStatus } from '../../lib/types'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_dashboard/queue')({
  component: QueuePage,
})

type QueueTicket = {
  id: string
  ticketNumber?: string
  subject?: string
  status: TicketStatus
  priority?: string
  createdAt?: string
  customer?: { name?: string; email?: string }
  // queue fields (may be named differently depending on backend)
  position?: number
  queuePosition?: number
  estimatedWaitMinutes?: number
}

function QueuePage() {
  const { user } = useAuth()

  const [queue, setQueue] = useState<QueueTicket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQueue = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.admin.getQueue()
      setTotal(data.total)
      setQueue(data.queue as QueueTicket[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    loadQueue()
  }, [user])

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center text-text-secondary">Unauthorized access.</div>
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message={error} retry={loadQueue} />

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-4xl">
        <div className="flex items-start justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">Queue Management</h1>
            <p className="text-text-secondary">
              Live ordered view of all pending customer tickets. ({total} total)
            </p>
          </div>

          <button
            onClick={loadQueue}
            className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-semibold hover:bg-bg"
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg border-b border-border text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Position</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Ticket</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Customer</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Status</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Est. Wait</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-secondary">
                    Queue is empty. All caught up!
                  </td>
                </tr>
              ) : (
                queue.map((t) => {
                  const pos = t.position ?? t.queuePosition ?? null
                  const status = STATUS_CONFIG[t.status]
                  return (
                    <tr key={t.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-5 py-4">
                        {pos ? (
                          <span className="w-8 h-8 rounded-full bg-primary-blue/10 text-primary-blue font-bold flex items-center justify-center">
                            {pos}
                          </span>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          to="/tickets/$ticketId"
                          params={{ ticketId: t.id }}
                          className="font-semibold text-text-dark hover:underline hover:text-primary-green block"
                        >
                          {t.ticketNumber ?? `#${t.id.slice(0, 8)}`}
                        </Link>
                        <span className="text-xs text-text-secondary">
                          {t.subject ?? '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-text-dark">{t.customer?.name ?? '—'}</p>
                        <p className="text-xs text-text-secondary">{t.customer?.email ?? ''}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {typeof t.estimatedWaitMinutes === 'number' ? (
                          <span className="text-warning font-semibold">{t.estimatedWaitMinutes} min</span>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}