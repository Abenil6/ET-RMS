import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { request } from './core'
import { queryClient } from './queryClient'
import type {
  Ticket,
  Technician,
  QueueInfo,
  CreateTicketInput,
  UpdateTicketInput,
  AssignTicketInput,
  ResolveTicketInput,
  ReviewTicketInput,
} from '@/types/tickets'

export type {
  Ticket,
  Technician,
  QueueInfo,
  CreateTicketInput,
  UpdateTicketInput,
  AssignTicketInput,
  ResolveTicketInput,
  ReviewTicketInput,
}

export type TechnicianType = Technician
export type QueueInfoType = QueueInfo

async function getAllTickets(): Promise<Ticket[]> {
  return request<Ticket[]>('/api/tickets')
}

async function getTicketById(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`)
}

async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  return request<Ticket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

async function deleteTicket(id: string): Promise<void> {
  return request<void>(`/api/tickets/${id}`, {
    method: 'DELETE',
  })
}

async function assignTicket(id: string, technicianId: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ technicianId }),
  })
}

async function resolveTicket(id: string, resolution: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  })
}

async function reopenTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}/reopen`, {
    method: 'POST',
  })
}

async function reviewTicket(id: string, rating: number, comment: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })
}

async function getTicketQueue(ticketId: string): Promise<QueueInfo> {
  return request<QueueInfo>(`/api/tickets/${ticketId}/queue`)
}

async function getTechnicians(): Promise<Technician[]> {
  return request<Technician[]>('/api/technicians')
}

export const ticketsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Ticket[], Error, Ticket[], string[]>) =>
      useQuery({
        queryKey: ['tickets'],
        queryFn: getAllTickets,
        meta: { errorMessage: 'Failed to load tickets.' },
        ...options,
      }),
  },

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

  create: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, CreateTicketInput>) =>
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

  update: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; data: UpdateTicketInput }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateTicket(id, data),
        meta: {
          successMessage: 'Ticket updated successfully.',
          errorMessage: 'Failed to update ticket.',
        },
        onMutate: async ({ id, data }) => {
          await queryClient.cancelQueries({ queryKey: ['tickets', id] })
          const previous = queryClient.getQueryData<Ticket>(['tickets', id])
          if (previous) {
            queryClient.setQueryData(['tickets', id], { ...previous, ...data })
          }
          return { previous } as { previous: Ticket | undefined }
        },
        onError: (_err, { id }, context) => {
          if (context && typeof context === 'object' && 'previous' in context && context.previous) {
            queryClient.setQueryData(['tickets', id], context.previous)
          }
        },
        onSuccess: (updatedTicket, variables) => {
          queryClient.setQueryData(['tickets', variables.id], updatedTicket)
          queryClient.invalidateQueries({ queryKey: ['tickets'], exact: true })
        },
        ...options,
      }),
  },

  delete: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: deleteTicket,
        meta: {
          successMessage: 'Ticket deleted successfully.',
          errorMessage: 'Failed to delete ticket.',
        },
        onSuccess: (_data, id) => {
          queryClient.removeQueries({ queryKey: ['tickets', id] })
          queryClient.invalidateQueries({ queryKey: ['tickets'], exact: true })
        },
        ...options,
      }),
  },

  assign: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; technicianId: string }>) =>
      useMutation({
        mutationFn: ({ id, technicianId }) => assignTicket(id, technicianId),
        meta: {
          successMessage: 'Ticket assigned.',
          errorMessage: 'Failed to assign ticket.',
        },
        onMutate: async ({ id, technicianId }) => {
          await queryClient.cancelQueries({ queryKey: ['tickets', id] })
          const previous = queryClient.getQueryData<Ticket>(['tickets', id])
          if (previous) {
            queryClient.setQueryData(['tickets', id], { ...previous, assignedTo: technicianId, status: 'in_progress' })
          }
          return { previous } as { previous: Ticket | undefined }
        },
        onError: (_err, { id }, context) => {
          if (context && typeof context === 'object' && 'previous' in context && context.previous) {
            queryClient.setQueryData(['tickets', id], context.previous)
          }
        },
        onSuccess: (updatedTicket, variables) => {
          queryClient.setQueryData(['tickets', variables.id], updatedTicket)
          queryClient.invalidateQueries({ queryKey: ['tickets'], exact: true })
        },
        ...options,
      }),
  },

  resolve: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; resolution: string }>) =>
      useMutation({
        mutationFn: ({ id, resolution }) => resolveTicket(id, resolution),
        meta: {
          successMessage: 'Ticket resolved.',
          errorMessage: 'Failed to resolve ticket.',
        },
        onMutate: async ({ id }) => {
          await queryClient.cancelQueries({ queryKey: ['tickets', id] })
          const previous = queryClient.getQueryData<Ticket>(['tickets', id])
          if (previous) {
            queryClient.setQueryData(['tickets', id], { ...previous, status: 'resolved' })
          }
          return { previous } as { previous: Ticket | undefined }
        },
        onError: (_err, { id }, context) => {
          if (context && typeof context === 'object' && 'previous' in context && context.previous) {
            queryClient.setQueryData(['tickets', id], context.previous)
          }
        },
        onSuccess: (updatedTicket, variables) => {
          queryClient.setQueryData(['tickets', variables.id], updatedTicket)
          queryClient.invalidateQueries({ queryKey: ['tickets'], exact: true })
        },
        ...options,
      }),
  },

  reopen: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, string>) =>
      useMutation({
        mutationFn: reopenTicket,
        meta: {
          successMessage: 'Ticket reopened.',
          errorMessage: 'Failed to reopen ticket.',
        },
        onSuccess: (updatedTicket, id) => {
          queryClient.setQueryData(['tickets', id], updatedTicket)
          queryClient.invalidateQueries({ queryKey: ['tickets'], exact: true })
        },
        ...options,
      }),
  },

  review: {
    useMutation: (options?: UseMutationOptions<Ticket, Error, { id: string; rating: number; comment: string }>) =>
      useMutation({
        mutationFn: ({ id, rating, comment }) => reviewTicket(id, rating, comment),
        meta: {
          successMessage: 'Review submitted.',
          errorMessage: 'Failed to submit review.',
        },
        onSuccess: (updatedTicket, variables) => {
          queryClient.setQueryData(['tickets', variables.id], updatedTicket)
          queryClient.invalidateQueries({ queryKey: ['tickets'], exact: true })
        },
        ...options,
      }),
  },

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

  getTechnicians: {
    useQuery: (options?: UseQueryOptions<Technician[], Error, Technician[], string[]>) =>
      useQuery({
        queryKey: ['technicians'],
        queryFn: getTechnicians,
        meta: { errorMessage: 'Failed to load technicians.' },
        staleTime: 1000 * 60 * 10,
        ...options,
      }),
  },
}

export default ticketsApi
