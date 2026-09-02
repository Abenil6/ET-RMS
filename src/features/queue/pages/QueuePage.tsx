import { useAuth } from '@/features/auth/hooks/useAuth'
import api from '@/apis'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { STATUS_CONFIG } from '@/data/tickets'
import type { TicketStatus } from '@/lib/types'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { AdminQueueItem } from '@/apis'

export function QueuePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const {
    data: queueData,
    isLoading: loading,
    isError,
    error,
    refetch: loadQueue,
  } = api.Admin.getAdminQueue.useQuery()

  const queue = queueData?.queue || []
  const total = queueData?.total || 0

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-text-secondary">
        {t('queue.unauthorized')}
      </div>
    )
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (isError)
    return (
      <ErrorMessage
        message={error.message || t('queue.error_loading')}
        retry={() => loadQueue()}
      />
    )

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">
              {t('queue.title')}
            </h1>
            <p className="text-text-secondary">
              {t('queue.subtitle', { total })}
            </p>
          </div>

          <button
            onClick={() => loadQueue()}
            className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-semibold hover:bg-bg"
            type="button"
          >
            {t('queue.refresh')}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg border-b border-border text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.position_column')}
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.ticket_column')}
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.customer_column')}
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.status_column')}
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.priority_column')}
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.estimated_wait_column')}
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  {t('queue.created_column')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-dark">
              {queue.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-text-secondary"
                  >
                    {t('queue.empty')}
                  </td>
                </tr>
              ) : (
                queue.map((ticket: AdminQueueItem) => (
                  <tr key={ticket.id} className="hover:bg-bg/50 transition">
                    <td className="px-5 py-3 font-mono font-bold text-lg">
                      {ticket.position}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium">#{ticket.ticketNumber}</p>
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {ticket.subject}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{ticket.customer.name}</p>
                      <p className="text-xs text-text-secondary">
                        {ticket.customer.email}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[ticket.status as TicketStatus].bg} ${STATUS_CONFIG[ticket.status as TicketStatus].color}`}
                      >
                        {STATUS_CONFIG[ticket.status as TicketStatus].label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            ticket.priority === 'CRITICAL' ||
                            ticket.priority === 'URGENT'
                              ? 'bg-error/10 text-error'
                              : ticket.priority === 'HIGH'
                                ? 'bg-warning/10 text-warning'
                                : ticket.priority === 'MEDIUM'
                                  ? 'bg-primary-blue/10 text-primary-blue'
                                  : 'bg-success/10 text-success'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      }
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {t('queue.minutes', {
                        count: ticket.estimatedWaitMinutes,
                      })}
                    </td>
                    <td className="px-5 py-3 text-xs text-text-secondary">
                      {new Date(ticket.createdAt).toLocaleString('en-ET', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
