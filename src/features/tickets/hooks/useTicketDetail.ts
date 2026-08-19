import { useEffect } from 'react'
import { ticketsApi } from '@/apis/tickets'
import { useQueuePosition } from '@/hooks/useQueuePosition'
import { useAuth } from '@/context/auth'
import type { Ticket } from '@/lib/types'

export function useTicketDetail(ticketId: string) {
  const { user } = useAuth()

  // Fetch ticket data
  const {
    data: ticket,
    isLoading: loading,
    isError,
    error: loadError,
    refetch: loadTicket,
  } = ticketsApi.getById.useQuery(ticketId)

  // Fetch technicians for admin assign
  const { data: technicians = [] } = ticketsApi.getTechnicians.useQuery()

  // Compute permissions
  const isAdmin = !!user && user.role === 'ADMIN'
  const isCustomer =
    !!user &&
    !!ticket &&
    user.role === 'CUSTOMER' &&
    user.id === ticket.customerId

  const isAssignedTech =
    !!user &&
    !!ticket &&
    user.role === 'TECHNICIAN' &&
    user.id === ticket.technicianId

  // Queue position tracking
  const queueEnabled =
    !!ticket &&
    ticket.status !== 'RESOLVED' &&
    ticket.status !== 'CLOSED' &&
    ticket.status !== 'CANCELLED'

  const {
    queue: liveQueue,
    lastUpdated: queueUpdatedAt,
    error: queueError,
    refresh: refreshQueue,
  } = useQueuePosition(ticket?.id, queueEnabled, 30000)

  const queueInfo = liveQueue ?? ticket?.queue

  // Compute action permissions
  const canEditDescription = isCustomer && ticket?.status === 'OPEN'
  const canCancel =
    isCustomer &&
    ticket &&
    (ticket.status === 'OPEN' ||
      ticket.status === 'ASSIGNED' ||
      ticket.status === 'IN_PROGRESS')
  const canStartWork =
    isAssignedTech &&
    ticket &&
    (ticket.status === 'ASSIGNED' || ticket.status === 'OPEN')
  const canResolve =
    (isAssignedTech || isAdmin) && ticket?.status === 'IN_PROGRESS'
  const canReopen =
    (isCustomer || isAdmin) &&
    ticket &&
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')
  const canReview =
    isCustomer &&
    ticket &&
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') &&
    !ticket.review

  return {
    ticket,
    loading,
    isError,
    loadError,
    loadTicket,
    technicians,
    isAdmin,
    isCustomer,
    isAssignedTech,
    queueEnabled,
    queueInfo,
    queueUpdatedAt,
    queueError,
    refreshQueue,
    canEditDescription,
    canCancel,
    canStartWork,
    canResolve,
    canReopen,
    canReview,
  }
}
