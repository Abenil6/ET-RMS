import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { request } from './core'
import type { Appointment } from '@/types/appointments'
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFormInput,
} from '@/types/appointments'

export type { Appointment, CreateAppointmentInput, UpdateAppointmentInput, AppointmentFormInput }
export type AppointmentType = Appointment

async function getAllAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/api/appointments')
}

async function createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
  return request<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function updateAppointment(id: string, data: UpdateAppointmentInput): Promise<Appointment> {
  return request<Appointment>(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const appointmentsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Appointment[], Error, Appointment[], string[]>) =>
      useQuery({
        queryKey: ['appointments'],
        queryFn: getAllAppointments,
        meta: { errorMessage: 'Failed to load appointments.' },
        ...options,
      }),
  },

  create: {
    useMutation: (options?: UseMutationOptions<Appointment, Error, CreateAppointmentInput>) =>
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

  update: {
    useMutation: (options?: UseMutationOptions<Appointment, Error, { id: string; data: UpdateAppointmentInput }>) =>
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

export default appointmentsApi
