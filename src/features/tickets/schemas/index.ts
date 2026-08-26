import { z } from 'zod'

// ============================================================
// Enums and Constants
// ============================================================

export const TicketCategoryEnum = z.enum(['CONNECTIVITY', 'HARDWARE', 'SOFTWARE', 'BILLING', 'OTHER'])
export const TicketPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export const TicketStatusEnum = z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'])

// ============================================================
// Validation Schemas
// ============================================================

/**
 * Schema for creating a new ticket
 * Defines all required fields and validation rules
 */
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .trim(),
  serviceNumber: z
    .string()
    .min(3, 'Service number is required')
    .max(50, 'Service number must not exceed 50 characters')
    .trim(),
  category: TicketCategoryEnum,
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  priority: TicketPriorityEnum,
})

/**
 * Schema for updating an existing ticket
 * All fields are optional for partial updates
 */
export const updateTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional(),
  status: TicketStatusEnum.optional(),
  priority: TicketPriorityEnum.optional(),
})

/**
 * Schema for assigning a ticket to a technician
 */
export const assignTicketSchema = z.object({
  technicianId: z.string().uuid('Invalid technician ID'),
})

/**
 * Schema for resolving a ticket
 */
export const resolveTicketSchema = z.object({
  resolution: z
    .string()
    .min(10, 'Resolution must be at least 10 characters')
    .max(2000, 'Resolution must not exceed 2000 characters')
    .trim(),
})

/**
 * Schema for reviewing a resolved ticket
 */
export const reviewTicketSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .trim(),
})

// ============================================================
// Inferred Types (Single Source of Truth)
// ============================================================

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type AssignTicketInput = z.infer<typeof assignTicketSchema>
export type ResolveTicketInput = z.infer<typeof resolveTicketSchema>
export type ReviewTicketInput = z.infer<typeof reviewTicketSchema>

export type TicketCategory = z.infer<typeof TicketCategoryEnum>
export type TicketPriority = z.infer<typeof TicketPriorityEnum>
export type TicketStatus = z.infer<typeof TicketStatusEnum>
