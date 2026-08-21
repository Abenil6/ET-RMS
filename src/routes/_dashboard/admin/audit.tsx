import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import api from '@/apis'
import type { AuditLogType } from '@/apis'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

export const Route = createFileRoute('/_dashboard/admin/audit')({
  component: AdminAuditPage,
})

const ACTION_LABELS: Record<string, string> = {
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

const ACTION_STYLES: Record<string, string> = {
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

  const [page, setPage] = useState(1)

  const { data: auditData, isLoading: loading, isError, error, refetch: loadLogs } = api.Admin.getAuditLogs.usePaginated(page, PAGE_SIZE)

  const logs = auditData?.logs || []
  const pagination = auditData?.pagination

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-text-secondary">
        Unauthorized access.
      </div>
    )
  }

  if (loading && logs.length === 0) return <LoadingSpinner size="lg" />
  if (isError && logs.length === 0) return <ErrorMessage message={error.message || 'Failed to load audit log'} retry={() => loadLogs()} />

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
            <h1 className="text-2xl font-bold text-text-dark mb-1">Audit Logs</h1>
            <p className="text-text-secondary">
              System-wide audit trail for all administrative actions.
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

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg border-b border-border text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Time</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">User</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Action</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Details</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-dark">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-secondary">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: AuditLogType) => {
                  const actor = log.performedByUser ?? log.user
                  const actorFallback = log.performedBy ?? log.userId ?? 'Unknown user'
                  const details = log.description ?? log.details ?? '—'

                  return (
                    <tr key={log.id} className="hover:bg-bg/50 transition">
                      <td className="px-5 py-3 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-ET', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{actor?.name ?? actorFallback}</p>
                        <p className="text-xs text-text-secondary">{actor?.email ?? actorFallback}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ACTION_STYLES[log.action] ?? 'bg-bg text-text-secondary'}`}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-secondary line-clamp-1 max-w-xs">
                        {details}
                      </td>
                      <td className="px-5 py-3 text-text-secondary font-mono text-xs">
                        {log.ipAddress ?? '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-text-secondary">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} logs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-dark hover:bg-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-dark hover:bg-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
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
