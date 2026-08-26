import type { TicketStatus, TicketPriority, TicketCategory } from './schemas'

export interface GetTicketsParams {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  search?: string
  page?: number
  limit?: number
}

export interface GetTicketByIdParams {
  id: string
}

export interface GetQueueInfoParams {
  ticketId: string
}
