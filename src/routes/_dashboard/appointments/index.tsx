import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/auth'
import { api, ApiError } from '../../../lib/api'
import { useFetch } from '../../../lib/useFetch'
import type { Appointment, AppointmentStatus } from '../../../lib/types'
import { CalendarPlus, MapPin, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'

export const Route = createFileRoute('/_dashboard/appointments/')({
  component: AppointmentsPage,
})

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  RESERVED: 'bg-primary-blue/10 text-primary-blue',
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-text-secondary/10 text-text-secondary',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-ET', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AppointmentsPage() {
  const { user } = useAuth()

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const {
    data: appointments,
    loading,
    error,
    refresh,
  } = useFetch<Appointment[]>(() => api.appointments.getAll(), [])

  const displayAppointments = useMemo(() => {
    if (!user) return []
    const list = appointments ?? []
    // Backend already role-scopes, but keep this safe:
    if (user.role === 'CUSTOMER') {
      return list.filter((a) => a.userId === user.id)
    }
    return list
  }, [appointments, user])

  const totalPages = Math.max(1, Math.ceil(displayAppointments.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedAppointments = displayAppointments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  if (!user) return null
  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  async function updateStatus(id: string, status: 'CANCELLED' | 'COMPLETED') {
    try {
      setActionLoadingId(id)
      setActionError(null)
      await api.appointments.update(id, status)
      await refresh()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to update appointment')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">Appointments</h1>
            <p className="text-text-secondary">
              {user.role === 'CUSTOMER'
                ? 'Manage your branch visits.'
                : 'Manage all customer branch visits.'}
            </p>
          </div>

          {user.role === 'CUSTOMER' && (
            <Link
              to="/appointments/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white font-semibold rounded-lg hover:bg-primary-green/90"
            >
              <CalendarPlus size={18} />
              Book Appointment
            </Link>
          )}
        </div>

        {actionError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {actionError}
          </div>
        )}

        <div className="space-y-4">
          {displayAppointments.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-border bg-card">
              <p className="text-text-secondary">No appointments found.</p>
            </div>
          ) : (
            pagedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[appointment.status]}`}
                    >
                      {appointment.status}
                    </span>

                    <p className="font-bold text-text-dark">
                      #{appointment.id.slice(0, 8)} — {appointment.notes || 'Branch visit'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                    {user.role !== 'CUSTOMER' && (
                      <div className="font-semibold text-text-dark border-r border-border pr-4">
                        {appointment.user.name}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} /> {appointment.branch}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={14} /> {formatDate(appointment.slotTime)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={14} /> {formatTime(appointment.slotTime)}
                    </div>
                  </div>
                </div>

                {appointment.status === 'RESERVED' && (
                  <div className="flex gap-2">
                    {user.role === 'CUSTOMER' ? (
                      <button
                        disabled={actionLoadingId === appointment.id}
                        onClick={() => updateStatus(appointment.id, 'CANCELLED')}
                        className="px-4 py-1.5 rounded-lg border border-error text-error text-sm font-semibold hover:bg-error/10 disabled:opacity-50"
                      >
                        {actionLoadingId === appointment.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    ) : (
                      <>
                        <button
                          disabled={actionLoadingId === appointment.id}
                          onClick={() => updateStatus(appointment.id, 'CANCELLED')}
                          className="px-4 py-1.5 rounded-lg border border-border text-text-dark text-sm font-semibold hover:bg-bg disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actionLoadingId === appointment.id}
                          onClick={() => updateStatus(appointment.id, 'COMPLETED')}
                          className="px-4 py-1.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">
              Page {safePage} of {totalPages} · {displayAppointments.length} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}