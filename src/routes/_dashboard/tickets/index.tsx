import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../../context/auth'
import { api } from '../../../lib/api'
import type { Ticket } from '../../../lib/types'
import { useFetch } from '../../../lib/useFetch'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'
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
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  if (!user) return null
  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message={error} retry={refresh} />

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
          <p className="text-text-secondary mt-1">
            {list.length} ticket{list.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Data Table */}
        <TicketsDataTable columns={columns} data={list} onRefresh={refresh} />
      </div>
    </motion.div>
  )
}
