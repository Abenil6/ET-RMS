import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import api from '@/apis'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { motion } from 'motion/react'
import { TicketsDataTable } from '../../../components/tables/tickets/data-table'
import { createTicketsColumns } from '../../../components/tables/tickets/columns'

export const Route = createFileRoute('/_dashboard/tickets/')({
  component: TicketsPage,
})

function TicketsPage() {
  const { user } = useAuth()
  const {
    data: tickets,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = api.Tickets.getAll.useQuery()

  if (!user) return null
  if (loading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorMessage message={error.message || 'Failed to load tickets'} retry={refresh} />

  const list = tickets ?? []

  const pageTitle =
    user.role === 'CUSTOMER'
      ? 'My Tickets'
      : user.role === 'TECHNICIAN'
        ? 'Assigned Tickets'
        : 'All Tickets'

  const columns = createTicketsColumns(user.role)

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-text-secondary">
            {user.role === 'CUSTOMER'
              ? 'Track the status of your support requests'
              : user.role === 'TECHNICIAN'
                ? 'Manage tickets assigned to you'
                : 'Manage all customer support tickets'}
          </p>
        </div>

        {/* Data Table */}
        <TicketsDataTable columns={columns} data={list} onRefresh={refresh} />
      </div>
    </motion.div>
  )
}
