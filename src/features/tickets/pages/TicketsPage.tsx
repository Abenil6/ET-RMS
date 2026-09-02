import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import api from '@/apis'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { motion } from 'motion/react'
import { TicketsDataTable } from '@/components/tables/tickets/data-table'
import { createTicketsColumns } from '@/components/tables/tickets/columns'

export function TicketsPage() {
  const { t } = useTranslation()
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
  if (isError)
    return (
      <ErrorMessage
        message={error.message || t('tickets.error_loading')}
        retry={refresh}
      />
    )

  const list = tickets ?? []

  const pageTitle =
    user.role === 'CUSTOMER'
      ? t('tickets.title_customer')
      : user.role === 'TECHNICIAN'
        ? t('tickets.title_technician')
        : t('tickets.title_admin')

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
              ? t('tickets.subtitle_customer')
              : user.role === 'TECHNICIAN'
                ? t('tickets.subtitle_technician')
                : t('tickets.subtitle_admin')}
          </p>
        </div>

        {/* Data Table */}
        <TicketsDataTable columns={columns} data={list} onRefresh={refresh} />
      </div>
    </motion.div>
  )
}
