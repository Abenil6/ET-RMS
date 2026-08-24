import { z } from 'zod'

// ============================================================
// Enums and Constants
// ============================================================

export const RoleEnum = z.enum(['CUSTOMER', 'TECHNICIAN', 'ADMIN'])

// ============================================================
// Validation Schemas
// ============================================================

/**
 * Schema for inviting a new user
 * Validates email, role, and optional name
 */
export const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  role: RoleEnum,
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .trim()
    .optional()
    .or(z.literal('')),
})

/**
 * Schema for updating user information
 * All fields are optional for partial updates
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim().optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  role: RoleEnum.optional(),
})

/**
 * Schema for banning/unbanning users
 */
export const banUserSchema = z.object({
  banned: z.boolean(),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .trim()
    .optional(),
})

/**
 * Schema for audit log filters
 */
export const auditLogFiltersSchema = z.object({
  action: z.string().optional(),
  resourceType: z.enum(['USER', 'TICKET', 'APPOINTMENT']).optional(),
  performedBy: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// ============================================================
// Inferred Types (Single Source of Truth)
// ============================================================

export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type BanUserInput = z.infer<typeof banUserSchema>
export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>
export type Role = z.infer<typeof RoleEnum>
