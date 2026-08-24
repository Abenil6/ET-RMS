
import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  serviceNumber: string
  category: 'CONNECTIVITY' | 'HARDWARE' | 'SOFTWARE' | 'BILLING' | 'OTHER'
  description: string
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  resolution: string | null
  customerId: string
  technicianId: string | null
  customer: {
    id: string
    name: string
    email: string
  }
  technician: {
    id: string
    name: string
    email: string
  } | null
  review: {
    rating: number
    comment: string
    createdAt: string
  } | null
  queue?: {
    position: number
    ahead: number
    estimatedWaitMinutes: number
  }
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


export type {
  CreateTicketInput,
  UpdateTicketInput,
  AssignTicketInput,
  ResolveTicketInput,
  ReviewTicketInput,
} from '@/features/tickets/schemas'

export type TicketFormType = {
  subject: string
  serviceNumber: string
  category: 'CONNECTIVITY' | 'HARDWARE' | 'SOFTWARE' | 'BILLING' | 'OTHER'
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export type TicketUpdateType = {
  subject?: string
  description?: string
  status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export type TechnicianType = Technician
export type QueueInfoType = QueueInfo

// ============================================================
// Raw Execution Functions
// ============================================================

async function getAllTickets(): Promise<Ticket[]> {
  return fetcher<Ticket[]>('/api/tickets')
}

async function getTicketById(id: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}`)
}

async function createTicket(data: TicketFormType): Promise<Ticket> {
  return fetcher<Ticket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function updateTicket(id: string, data: TicketUpdateType): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

async function deleteTicket(id: string): Promise<void> {
  return fetcher<void>(`/api/tickets/${id}`, {
    method: 'DELETE',
  })
}

async function assignTicket(id: string, technicianId: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ technicianId }),
  })
}

async function resolveTicket(id: string, resolution: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  })
}

async function reopenTicket(id: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/reopen`, {
    method: 'POST',
  })
}

async function reviewTicket(id: string, rating: number, comment: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })
}

async function getTicketQueue(ticketId: string): Promise<QueueInfo> {
  return fetcher<QueueInfo>(`/api/tickets/${ticketId}/queue`)
}

async function getTechnicians(): Promise<Technician[]> {
  return fetcher<Technician[]>('/api/technicians')
}

// ============================================================
// Hooks Object Definition
// ============================================================

export const ticketsApi = {
  /**
   * Fetch all tickets for the current user
   */
  getAll: {
    useQuery: (options?: UseQueryOptions<Ticket[], Error, Ticket[], string[]>) =>
      useQuery({
        queryKey: ['tickets'],
        queryFn: getAllTickets,
        meta: { errorMessage: 'Failed to load tickets.' },
        ...options,
      }),
  },

  /**
   * Fetch a single ticket by ID
   */
  getById: {
    useQuery: (id: string, options?: UseQueryOptions<Ticket, Error, Ticket, string[]>) =>
      useQuery({
        queryKey: ['tickets', id],
        queryFn: () => getTicketById(id),
        meta: { errorMessage: 'Failed to load ticket.' },
        enabled: !!id,
        ...options,
      }),
  },

  /**
   * Create a new ticket
   * Automatically invalidates tickets list on success
   */
  create: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, TicketFormType>) =>
      useMutation({
        mutationFn: createTicket,
        meta: {
          successMessage: 'Ticket created successfully!',
          errorMessage: 'Failed to create ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Update ticket fields (partial update)
   * Automatically invalidates tickets cache on success
   */
  update: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; data: TicketUpdateType }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateTicket(id, data),
        meta: {
          successMessage: 'Ticket updated successfully.',
          errorMessage: 'Failed to update ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Delete a ticket permanently
   * Automatically invalidates tickets cache on success
   */
  delete: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: deleteTicket,
        meta: {
          successMessage: 'Ticket deleted successfully.',
          errorMessage: 'Failed to delete ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Assign ticket to a technician
   * Automatically invalidates tickets cache on success
   */
  assign: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; technicianId: string }>) =>
      useMutation({
        mutationFn: ({ id, technicianId }) => assignTicket(id, technicianId),
        meta: {
          successMessage: 'Ticket assigned.',
          errorMessage: 'Failed to assign ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Resolve a ticket with resolution notes
   * Automatically invalidates tickets cache on success
   */
  resolve: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; resolution: string }>) =>
      useMutation({
        mutationFn: ({ id, resolution }) => resolveTicket(id, resolution),
        meta: {
          successMessage: 'Ticket resolved.',
          errorMessage: 'Failed to resolve ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Reopen a closed or resolved ticket
   * Automatically invalidates tickets cache on success
   */
  reopen: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, string>) =>
      useMutation({
        mutationFn: reopenTicket,
        meta: {
          successMessage: 'Ticket reopened.',
          errorMessage: 'Failed to reopen ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Submit a review for a resolved ticket
   * Automatically invalidates tickets cache on success
   */
  review: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; rating: number; comment: string }>) =>
      useMutation({
        mutationFn: ({ id, rating, comment }) => reviewTicket(id, rating, comment),
        meta: {
          successMessage: 'Review submitted.',
          errorMessage: 'Failed to submit review.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  /**
   * Fetch ticket queue position and wait time
   * Useful for real-time queue monitoring
   */
  getQueue: {
    useQuery: (
      ticketId: string,
      options?: Omit<UseQueryOptions<QueueInfo, Error, QueueInfo, string[]>, 'queryKey' | 'queryFn'>,
    ) =>
      useQuery({
        queryKey: ['tickets', 'queue', ticketId],
        queryFn: () => getTicketQueue(ticketId),
        meta: { errorMessage: 'Failed to load queue position.' },
        enabled: !!ticketId,
        ...options,
      }),
  },

  /**
   * Fetch all available technicians
   * Used for ticket assignment
   */
  getTechnicians: {
    useQuery: (options?: UseQueryOptions<Technician[], Error, Technician[], string[]>) =>
      useQuery({
        queryKey: ['tickets', 'technicians'],
        queryFn: getTechnicians,
        meta: { errorMessage: 'Failed to load technicians.' },
        ...options,
      }),
  },
}

// ============================================================
// Default Export
// ============================================================

export default ticketsApi
