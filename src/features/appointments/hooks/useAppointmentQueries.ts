import api from '@/apis'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { Appointment } from '@/apis'

/**
 * Hook for fetching all appointments
 * No network code in components - use this hook instead
 */
export function useAppointments(options?: UseQueryOptions<Appointment[], Error, Appointment[], string[]>) {
  return api.Appointments.getAll.useQuery(options)
}
