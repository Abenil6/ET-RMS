import type { TicketStatus, TicketPriority, TicketCategory } from '../core'

export interface TicketCustomer {
  id: string
  name: string
  email: string
}

export interface TicketTechnician {
  id: string
  name: string
  email: string
}

export interface TicketReview {
  rating: number
  comment: string
  createdAt: string
}

export interface TicketQueue {
  position: number
  ahead: number
  estimatedWaitMinutes: number
}

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  serviceNumber: string
  category: TicketCategory
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  resolution: string | null
  customerId: string
  technicianId: string | null
  customer: TicketCustomer
  technician: TicketTechnician | null
  review: TicketReview | null
  queue?: TicketQueue
}

export interface Technician {
  id: string
  name: string
  email: string
  openTickets?: number
  activeTickets?: number
}

export interface QueueInfo {
  ticketNumber?: string
  status?: string
  position: number
  ahead: number
  estimatedWaitMinutes: number
}
