import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'
import type { Ticket, TicketCategory, TicketPriority } from '../lib/types'

// ============================================================
// Types
// ============================================================

export interface TicketFormType {
  subject: string
  serviceNumber: string
  category: TicketCategory
  description: string
  priority: TicketPriority
}

export interface TicketUpdateType {
  subject?: string
  description?: string
  status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
  priority?: TicketPriority
}

export interface TechnicianType {
  id: string
  name: string
  email: string
  openTickets?: number
  activeTickets?: number
}

export interface QueueInfoType {
  ticketNumber?: string
  status?: string
  position: number
  ahead: number
  estimatedWaitMinutes: number
}

// ============================================================
// Raw API Functions
// ============================================================

async function getTicketsFn(): Promise<Ticket[]> {
  return fetcher<Ticket[]>('/api/tickets')
}

async function getTicketByIdFn(id: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}`)
}

async function createTicketFn(data: TicketFormType): Promise<Ticket> {
  return fetcher<Ticket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function updateTicketFn(id: string, data: TicketUpdateType): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

async function deleteTicketFn(id: string): Promise<void> {
  return fetcher<void>(`/api/tickets/${id}`, {
    method: 'DELETE',
  })
}

async function assignTicketFn(id: string, technicianId: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ technicianId }),
  })
}

async function resolveTicketFn(id: string, resolution: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  })
}

async function reopenTicketFn(id: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/reopen`, {
    method: 'POST',
  })
}

async function reviewTicketFn(id: string, rating: number, comment: string): Promise<Ticket> {
  return fetcher<Ticket>(`/api/tickets/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })
}

async function getQueueFn(ticketId: string): Promise<QueueInfoType> {
  return fetcher<QueueInfoType>(`/api/tickets/${ticketId}/queue`)
}

async function getTechniciansFn(): Promise<TechnicianType[]> {
  return fetcher<TechnicianType[]>('/api/technicians')
}

// ============================================================
// Typed Hooks
// ============================================================

export const ticketsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Ticket[], Error, Ticket[], string[]>) =>
      useQuery({
        queryKey: ['tickets'],
        queryFn: getTicketsFn,
        meta: { errorMessage: 'Failed to load tickets.' },
        ...options,
      }),
  },

  getById: {
    useQuery: (id: string, options?: UseQueryOptions<Ticket, Error, Ticket, string[]>) =>
      useQuery({
        queryKey: ['tickets', id],
        queryFn: () => getTicketByIdFn(id),
        meta: { errorMessage: 'Failed to load ticket.' },
        enabled: !!id,
        ...options,
      }),
  },

  create: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, TicketFormType>) =>
      useMutation({
        mutationFn: createTicketFn,
        meta: {
          successMessage: 'Ticket created successfully!',
          errorMessage: 'Failed to create ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  update: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; data: TicketUpdateType }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateTicketFn(id, data),
        meta: {
          successMessage: 'Ticket updated successfully.',
          errorMessage: 'Failed to update ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  delete: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: deleteTicketFn,
        meta: {
          successMessage: 'Ticket deleted successfully.',
          errorMessage: 'Failed to delete ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  assign: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; technicianId: string }>) =>
      useMutation({
        mutationFn: ({ id, technicianId }) => assignTicketFn(id, technicianId),
        meta: {
          successMessage: 'Ticket assigned.',
          errorMessage: 'Failed to assign ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  resolve: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; resolution: string }>) =>
      useMutation({
        mutationFn: ({ id, resolution }) => resolveTicketFn(id, resolution),
        meta: {
          successMessage: 'Ticket resolved.',
          errorMessage: 'Failed to resolve ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  reopen: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, string>) =>
      useMutation({
        mutationFn: reopenTicketFn,
        meta: {
          successMessage: 'Ticket reopened.',
          errorMessage: 'Failed to reopen ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  review: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; rating: number; comment: string }>) =>
      useMutation({
        mutationFn: ({ id, rating, comment }) => reviewTicketFn(id, rating, comment),
        meta: {
          successMessage: 'Review submitted.',
          errorMessage: 'Failed to submit review.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  getQueue: {
    useQuery: (
      ticketId: string,
      options?: Omit<UseQueryOptions<QueueInfoType, Error, QueueInfoType, string[]>, 'queryKey' | 'queryFn'>,
    ) =>
      useQuery({
        queryKey: ['tickets', 'queue', ticketId],
        queryFn: () => getQueueFn(ticketId),
        meta: { errorMessage: 'Failed to load queue position.' },
        enabled: !!ticketId,
        ...options,
      }),
  },

  getTechnicians: {
    useQuery: (options?: UseQueryOptions<TechnicianType[], Error, TechnicianType[], string[]>) =>
      useQuery({
        queryKey: ['tickets', 'technicians'],
        queryFn: getTechniciansFn,
        meta: { errorMessage: 'Failed to load technicians.' },
        ...options,
      }),
  },
}
