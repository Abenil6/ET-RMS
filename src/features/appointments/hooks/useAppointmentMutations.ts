import api from '@/apis'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { Appointment } from '@/apis'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from '../schemas'

/**
 * Hook for creating a new appointment
 * Validates input against createAppointmentSchema before submission
 */
export function useCreateAppointment(options?: UseMutationOptions<Appointment, Error, CreateAppointmentInput>) {
  return api.Appointments.create.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      createAppointmentSchema.parse(variables)
      return options?.onMutate?.(variables)
    },
  })
}

/**
 * Hook for updating appointment status (cancel/complete)
 * Validates status transition before submission
 */
export function useUpdateAppointment(
  options?: UseMutationOptions<Appointment, Error, { id: string; data: UpdateAppointmentInput }>
) {
  return api.Appointments.update.useMutation({
    ...options,
    onMutate: async (variables) => {
      // Validate before mutation
      updateAppointmentSchema.parse(variables.data)
      return options?.onMutate?.(variables)
    },
  })
}
