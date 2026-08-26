import type { Ticket, Technician, QueueInfo } from './entities'
import type { SuccessRes } from '../core'

export type GetTicketsResponse = Ticket[]

export type GetTicketByIdResponse = Ticket

export type CreateTicketResponse = Ticket

export type UpdateTicketResponse = Ticket

export type DeleteTicketResponse = SuccessRes

export type AssignTicketResponse = Ticket

export type ResolveTicketResponse = Ticket

export type ReopenTicketResponse = Ticket

export type ReviewTicketResponse = Ticket

export type GetTechniciansResponse = Technician[]

export type GetQueueInfoResponse = QueueInfo
