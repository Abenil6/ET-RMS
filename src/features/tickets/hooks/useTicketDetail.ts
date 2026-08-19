import api from '@/apis'
import { useQueuePosition } from '@/hooks/useQueuePosition'
import { useAuth } from '@/context/auth'

export function useTicketDetail(ticketId: string) {
  const { user } = useAuth()

  // Fetch ticket data
  const {
    data: ticket,
    isLoading: loading,
    isError,
    error: loadError,
    refetch: loadTicket,
  } = api.Tickets.getById.useQuery(ticketId)

  // Fetch technicians for admin assign
  const { data: technicians = [] } = api.Tickets.getTechnicians.useQuery()

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
  const ticketStatus = ticket?.status
  const hasReview = Boolean(ticket?.review)
  const canEditDescription = isCustomer && ticketStatus === 'OPEN'
  const canCancel =
    isCustomer &&
    (ticketStatus === 'OPEN' ||
      ticketStatus === 'ASSIGNED' ||
      ticketStatus === 'IN_PROGRESS')
  const canStartWork =
    isAssignedTech &&
    (ticketStatus === 'ASSIGNED' || ticketStatus === 'OPEN')
  const canResolve =
    (isAssignedTech || isAdmin) && ticketStatus === 'IN_PROGRESS'
  const canReopen =
    (isCustomer || isAdmin) &&
    (ticketStatus === 'RESOLVED' || ticketStatus === 'CLOSED')
  const canReview =
    isCustomer &&
    (ticketStatus === 'RESOLVED' || ticketStatus === 'CLOSED') &&
    !hasReview

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
