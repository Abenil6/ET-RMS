import { z } from 'zod'

// ============================================================
// Enums and Constants
// ============================================================

export const AppointmentStatusEnum = z.enum(['RESERVED', 'COMPLETED', 'CANCELLED'])

// ============================================================
// Validation Schemas
// ============================================================

/**
 * Schema for creating a new appointment
 * Validates branch, time slot, and optional notes
 */
export const createAppointmentSchema = z.object({
  branch: z
    .string()
    .min(1, 'Branch is required')
    .max(100, 'Branch name must not exceed 100 characters')
    .trim(),
  slotTime: z
    .string()
    .datetime({ message: 'Invalid date and time format' })
    .refine(
      (val) => {
        const slotDate = new Date(val)
        const now = new Date()
        return slotDate > now
      },
      { message: 'Appointment time must be in the future' }
    ),
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
})

/**
 * Schema for updating appointment status
 * Only allows status transitions
 */
export const updateAppointmentSchema = z.object({
  status: z.enum(['CANCELLED', 'COMPLETED'], {
    message: 'Status can only be CANCELLED or COMPLETED',
  }),
})

/**
 * Schema for appointment booking form (client-side)
 * Uses date and time inputs separately before conversion to ISO string
 */
export const appointmentFormSchema = z.object({
  branch: z.string().min(1, 'Please select a branch'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine(
      (val) => {
        const selectedDate = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: 'Date cannot be in the past' }
    ),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional().or(z.literal('')),
})

// ============================================================
// Inferred Types (Single Source of Truth)
// ============================================================

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>
export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>
