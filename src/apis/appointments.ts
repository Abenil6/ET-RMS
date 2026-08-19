import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'
import type { Appointment } from '../lib/types'

// ============================================================
// Types
// ============================================================

export type AppointmentType = Appointment

export interface AppointmentFormType {
  branch: string
  slotTime: string
  notes?: string
}

export interface AppointmentUpdateType {
  status: 'CANCELLED' | 'COMPLETED'
}

// ============================================================
// Raw API Functions
// ============================================================

async function getAppointmentsFn(): Promise<Appointment[]> {
  return fetcher<Appointment[]>('/api/appointments')
}

async function createAppointmentFn(data: AppointmentFormType): Promise<Appointment> {
  return fetcher<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function updateAppointmentFn(id: string, data: AppointmentUpdateType): Promise<Appointment> {
  return fetcher<Appointment>(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ============================================================
// Typed Hooks
// ============================================================

export const appointmentsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Appointment[], Error, Appointment[], string[]>) =>
      useQuery({
        queryKey: ['appointments'],
        queryFn: getAppointmentsFn,
        meta: { errorMessage: 'Failed to load appointments.' },
        ...options,
      }),
  },

  create: {
    useMutation: (options?: UseMutationOptions<Appointment, Error, AppointmentFormType>) =>
      useMutation({
        mutationFn: createAppointmentFn,
        meta: {
          successMessage: 'Appointment booked!',
          errorMessage: 'Failed to book appointment.',
          invalidateQueries: ['appointments'],
        },
        ...options,
      }),
  },

  update: {
    useMutation: (options?: UseMutationOptions<Appointment, Error, { id: string; data: AppointmentUpdateType }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateAppointmentFn(id, data),
        meta: {
          successMessage: 'Appointment updated.',
          errorMessage: 'Failed to update appointment.',
          invalidateQueries: ['appointments'],
        },
        ...options,
      }),
  },
}
