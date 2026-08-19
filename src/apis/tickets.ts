import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../lib/types'

// types
export type TicketType = Ticket

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
  priority?: TicketPriority
  status?: TicketStatus
}

export interface QueueInfoType {
  position: number
  ahead: number
  estimatedWaitMinutes: number
}

// api functions
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

async function getQueueFn(): Promise<QueueInfoType> {
  return fetcher<QueueInfoType>('/api/tickets/queue')
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

async function getTechniciansFn(): Promise<Array<{ id: string; name: string; email: string; openTickets?: number }>> {
  return fetcher<Array<{ id: string; name: string; email: string; openTickets?: number }>>('/api/admin/technicians')
}

// Typed Hooks

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
          successMessage: 'Ticket updated.',
          errorMessage: 'Failed to update ticket.',
          invalidateQueries: ['tickets'],
        },
        ...options,
      }),
  },

  getQueue: {
    useQuery: (options?: UseQueryOptions<QueueInfoType, Error, QueueInfoType, string[]>) =>
      useQuery({
        queryKey: ['tickets', 'queue'],
        queryFn: getQueueFn,
        meta: { errorMessage: 'Failed to load queue position.' },
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

  getTechnicians: {
    useQuery: (options?: UseQueryOptions<Array<{ id: string; name: string; email: string; openTickets?: number }>, Error, Array<{ id: string; name: string; email: string; openTickets?: number }>, string[]>) =>
      useQuery({
        queryKey: ['admin', 'technicians'],
        queryFn: getTechniciansFn,
        meta: { errorMessage: 'Failed to load technicians.' },
        ...options,
      }),
  },
}
