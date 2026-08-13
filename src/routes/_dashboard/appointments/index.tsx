import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/auth'
import { api, ApiError } from '../../../lib/api'
import { useFetch } from '../../../lib/useFetch'
import type { Appointment } from '../../../lib/types'
import { motion } from 'motion/react'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'
import { AppointmentsDataTable } from '../../../components/tables/appointments/data-table'
import { createAppointmentsColumns } from '../../../components/tables/appointments/columns'

export const Route = createFileRoute('/_dashboard/appointments/')({
  component: AppointmentsPage,
})

function AppointmentsPage() {
  const { user } = useAuth()

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to update appointment',
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = (id: string) => updateStatus(id, 'CANCELLED')
  const handleComplete = (id: string) => updateStatus(id, 'COMPLETED')

  const columns = createAppointmentsColumns(user.role, handleCancel, handleComplete)

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-dark mb-1">
            Appointments
          </h1>
          <p className="text-text-secondary">
            {user.role === 'CUSTOMER'
              ? 'Manage your branch visits.'
              : 'Manage all customer branch visits.'}
          </p>
        </div>

        {actionError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {actionError}
          </div>
        )}

        {actionLoadingId && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
            Updating appointment...
          </div>
        )}

        <AppointmentsDataTable columns={columns} data={displayAppointments} />
      </div>
    </motion.div>
  )
}
