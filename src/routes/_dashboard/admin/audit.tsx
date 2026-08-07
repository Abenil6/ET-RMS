import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ScrollText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../../context/auth'
import { api, ApiError } from '../../../lib/api'
import type {
  AuditLog,
  AuditAction,
  AuditLogPagination,
} from '../../../lib/types'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'

export const Route = createFileRoute('/_dashboard/admin/audit')({
  component: AdminAuditPage,
})

const ACTION_LABELS: Record<AuditAction, string> = {
  USER_CREATED: 'User Created',
  USER_UPDATED: 'User Updated',
  USER_BANNED: 'User Banned',
  USER_UNBANNED: 'User Unbanned',
  USER_DELETED: 'User Deleted',
  USER_PASSWORD_RESET: 'Password Reset',
  ROLE_CHANGED: 'Role Changed',
  LOGIN_ATTEMPT: 'Login Attempt',
  LOGOUT: 'Logout',
}

const ACTION_STYLES: Record<AuditAction, string> = {
  USER_CREATED: 'bg-primary-green/10 text-primary-green',
  USER_UPDATED: 'bg-primary-blue/10 text-primary-blue',
  USER_BANNED: 'bg-error/10 text-error',
  USER_UNBANNED: 'bg-success/10 text-success',
  USER_DELETED: 'bg-error/10 text-error',
  USER_PASSWORD_RESET: 'bg-warning/10 text-warning',
  ROLE_CHANGED: 'bg-warning/10 text-warning',
  LOGIN_ATTEMPT: 'bg-bg text-text-secondary',
  LOGOUT: 'bg-bg text-text-secondary',
}

const PAGE_SIZE = 25

function AdminAuditPage() {
  const { user } = useAuth()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<AuditLogPagination | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = async (targetPage = page) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.admin.getAuditLogs(targetPage, PAGE_SIZE)
      setLogs(data.logs as AuditLog[])
      setPagination(data.pagination)
      setPage(targetPage)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    void loadLogs(1)
  }, [user])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-text-secondary">
        Unauthorized access.
      </div>
    )
  }

  if (loading && logs.length === 0) return <LoadingSpinner size="lg" />
  if (error && logs.length === 0) return <ErrorMessage message={error} retry={() => loadLogs()} />

  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">Audit Log</h1>
            <p className="text-text-secondary">
              A record of administrative actions across the system. ({total}{' '}
              events)
            </p>
          </div>

          <button
            onClick={() => loadLogs()}
            className="p-2 rounded-lg border border-border text-text-dark hover:bg-bg transition"
            type="button"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {error && logs.length > 0 && (
          <div className="mb-5 p-4 rounded-xl border border-error/20 bg-error/10 text-error text-sm font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => loadLogs()} className="underline">
              Retry
            </button>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg border-b border-border text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  Action
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  Details
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  Performed By
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  When
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  IP
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-text-secondary">
                    No audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ACTION_STYLES[log.action]}`}
                      >
                        <ScrollText size={12} />
                        {ACTION_LABELS[log.action]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-text-dark">{log.description}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {log.resourceType} · {log.resourceId}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-text-dark">
                        {log.performedByUser.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {log.performedByUser.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-ET', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-5 py-4 text-xs text-text-secondary font-mono">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-text-secondary">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLogs(page - 1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-border text-text-dark hover:bg-bg transition disabled:opacity-40"
                type="button"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => loadLogs(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg border border-border text-text-dark hover:bg-bg transition disabled:opacity-40"
                type="button"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
