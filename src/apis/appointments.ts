/**
 * ============================================================
 * Appointments Resource API
 * Phase 3: Centralized Resource API Layer
 * ============================================================
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'

// ============================================================
// Backend & DB Interfaces
// ============================================================

export interface Appointment {
  id: string
  branch: string
  slotTime: string
  status: 'RESERVED' | 'COMPLETED' | 'CANCELLED'
  notes: string | null
  createdAt: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
}

// ============================================================
// Payload Imports (from Phase 2 domain schemas)
// ============================================================

export type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFormInput,
} from '@/features/appointments/schemas'

// Re-export for backwards compatibility
export type AppointmentType = Appointment

export type AppointmentFormType = {
  branch: string
  slotTime: string
  notes?: string
}

export type AppointmentUpdateType = {
  status: 'CANCELLED' | 'COMPLETED'
}

// ============================================================
// Raw Execution Functions
// ============================================================

async function getAllAppointments(): Promise<Appointment[]> {
  return fetcher<Appointment[]>('/api/appointments')
}

async function createAppointment(data: AppointmentFormType): Promise<Appointment> {
  return fetcher<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function updateAppointment(id: string, data: AppointmentUpdateType): Promise<Appointment> {
  return fetcher<Appointment>(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ============================================================
// Hooks Object Definition
// ============================================================

export const appointmentsApi = {
  /**
   * Fetch all appointments for the current user
   */
  getAll: {
    useQuery: (options?: UseQueryOptions<Appointment[], Error, Appointment[], string[]>) =>
      useQuery({
        queryKey: ['appointments'],
        queryFn: getAllAppointments,
        meta: { errorMessage: 'Failed to load appointments.' },
        ...options,
      }),
  },

  /**
   * Book a new appointment
   * Automatically invalidates appointments list on success
   */
  create: {
    useMutation: (options?: UseMutationOptions<Appointment, Error, AppointmentFormType>) =>
      useMutation({
        mutationFn: createAppointment,
        meta: {
          successMessage: 'Appointment booked!',
          errorMessage: 'Failed to book appointment.',
          invalidateQueries: ['appointments'],
        },
        ...options,
      }),
  },

  /**
   * Update appointment status (cancel/complete)
   * Automatically invalidates appointments cache on success
   */
  update: {
    useMutation: (options?: UseMutationOptions<Appointment, Error, { id: string; data: AppointmentUpdateType }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateAppointment(id, data),
        meta: {
          successMessage: 'Appointment updated.',
          errorMessage: 'Failed to update appointment.',
          invalidateQueries: ['appointments'],
        },
        ...options,
      }),
  },
}

// ============================================================
// Default Export
// ============================================================

export default appointmentsApi
