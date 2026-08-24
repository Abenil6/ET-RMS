import api from '@/apis'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { Ticket, TechnicianType, QueueInfoType } from '@/apis'

/**
 * Hook for fetching all tickets
 * No network code in components - use this hook instead
 */
export function useTickets(options?: UseQueryOptions<Ticket[], Error, Ticket[], string[]>) {
  return api.Tickets.getAll.useQuery(options)
}

/**
 * Hook for fetching a single ticket by ID
 * Automatically disabled if no ID provided
 */
export function useTicket(id: string, options?: UseQueryOptions<Ticket, Error, Ticket, string[]>) {
  return api.Tickets.getById.useQuery(id, options)
}

/**
 * Hook for fetching available technicians
 * Used for ticket assignment
 */
export function useTechnicians(options?: UseQueryOptions<TechnicianType[], Error, TechnicianType[], string[]>) {
  return api.Tickets.getTechnicians.useQuery(options)
}

/**
 * Hook for fetching ticket queue position
 * Polls for real-time queue updates
 */
export function useTicketQueue(
  ticketId: string,
  options?: Omit<UseQueryOptions<QueueInfoType, Error, QueueInfoType, string[]>, 'queryKey' | 'queryFn'>
) {
  return api.Tickets.getQueue.useQuery(ticketId, options)
}
