import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useAuth } from '../../../context/auth'
import api from '@/apis'
import { motion } from 'motion/react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { AppointmentsDataTable } from '../../../components/tables/appointments/data-table'
import { createAppointmentsColumns } from '../../../components/tables/appointments/columns'

export const Route = createFileRoute('/_dashboard/appointments/')({
  component: AppointmentsPage,
})

function AppointmentsPage() {
  const { user } = useAuth()

  const {
    data: appointments,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = api.Appointments.getAll.useQuery()

  const { mutate: updateAppointment } = api.Appointments.update.useMutation()

  const displayAppointments = useMemo(() => {
    if (!user) return []
    const list = appointments ?? []
    if (user.role === 'CUSTOMER') {
      return list.filter((a) => a.userId === user.id)
    }
    return list
  }, [appointments, user])

  if (!user) return null
  if (loading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorMessage message={error.message || 'Failed to load appointments'} retry={refresh} />

  function handleCancel(id: string) {
    updateAppointment({ id, data: { status: 'CANCELLED' } })
  }

  function handleComplete(id: string) {
    updateAppointment({ id, data: { status: 'COMPLETED' } })
  }

  const columns = createAppointmentsColumns(
    user.role,
    handleCancel,
    handleComplete,
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-text-secondary">
            {user.role === 'CUSTOMER'
              ? 'View and manage your scheduled appointments'
              : 'Manage all customer appointments'}
          </p>
        </div>

        <AppointmentsDataTable columns={columns} data={displayAppointments} />
      </div>
    </motion.div>
  )
}
