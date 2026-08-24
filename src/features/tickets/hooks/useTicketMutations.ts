import api from '@/apis'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { Ticket } from '@/apis'
import {
  createTicketSchema,
  updateTicketSchema,
  assignTicketSchema,
  resolveTicketSchema,
  reviewTicketSchema,
  type CreateTicketInput,
  type UpdateTicketInput,
  type AssignTicketInput,
  type ResolveTicketInput,
  type ReviewTicketInput,
} from '../schemas'

/**
 * Hook for creating a new ticket
 * Validates input against createTicketSchema before submission
 */
export function useCreateTicket(options?: UseMutationOptions<Ticket, Error, CreateTicketInput>) {
  return api.Tickets.create.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      createTicketSchema.parse(variables)
      return options?.onMutate?.(variables)
    },
  })
}

/**
 * Hook for updating an existing ticket
 * Validates input against updateTicketSchema before submission
 */
export function useUpdateTicket(
  options?: UseMutationOptions<Ticket, Error, { id: string; data: UpdateTicketInput }>
) {
  return api.Tickets.update.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      updateTicketSchema.parse(variables.data)
      return options?.onMutate?.(variables)
    },
  })
}

/**
 * Hook for assigning a ticket to a technician
 * Validates technicianId before submission
 */
export function useAssignTicket(
  options?: UseMutationOptions<Ticket, Error, { id: string; technicianId: string }>
) {
  return api.Tickets.assign.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      assignTicketSchema.parse({ technicianId: variables.technicianId })
      return options?.onMutate?.(variables)
    },
  })
}

/**
 * Hook for resolving a ticket
 * Validates resolution text before submission
 */
export function useResolveTicket(
  options?: UseMutationOptions<Ticket, Error, { id: string; resolution: string }>
) {
  return api.Tickets.resolve.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      resolveTicketSchema.parse({ resolution: variables.resolution })
      return options?.onMutate?.(variables)
    },
  })
}

/**
 * Hook for reviewing a resolved ticket
 * Validates rating and comment before submission
 */
export function useReviewTicket(
  options?: UseMutationOptions<Ticket, Error, { id: string; rating: number; comment: string }>
) {
  return api.Tickets.review.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      reviewTicketSchema.parse({ rating: variables.rating, comment: variables.comment })
      return options?.onMutate?.(variables)
    },
  })
}

/**
 * Hook for reopening a closed ticket
 */
export function useReopenTicket(options?: UseMutationOptions<Ticket, Error, string>) {
  return api.Tickets.reopen.useMutation(options)
}

/**
 * Hook for deleting a ticket
 */
export function useDeleteTicket(options?: UseMutationOptions<void, Error, string>) {
  return api.Tickets.delete.useMutation(options)
}
