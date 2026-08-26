import type { TicketCategory, TicketPriority, TicketStatus } from './schemas'

export interface CreateTicketPayload {
  subject: string
  serviceNumber: string
  category: TicketCategory
  description: string
  priority: TicketPriority
}

export interface UpdateTicketPayload {
  subject?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
}

export interface AssignTicketPayload {
  technicianId: string
}

export interface ResolveTicketPayload {
  resolution: string
}

export interface ReviewTicketPayload {
  rating: number
  comment: string
}
