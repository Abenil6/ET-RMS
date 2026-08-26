/**
 * ============================================================
 * Admin Resource API
 * Phase 3: Centralized Resource API Layer
 * ============================================================
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'

// ============================================================
// Backend & DB Interfaces
// ============================================================

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
  banned: boolean
  bannedAt: string | null
  createdAt: string
  lastLoginAt: string | null
}

export interface Technician {
  id: string
  name: string
  email: string
  openTickets?: number
  activeTickets?: number
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  resourceType?: string
  resourceId?: string
  description?: string
  changes?: string | null
  performedBy?: string
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  status?: string
  errorMessage?: string | null
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  performedByUser?: {
    id: string
    name: string
    email: string
  }
}

export interface AuditLogPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: AuditLogPagination
}

export interface QueueStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  averageWaitTime: number
}

export interface AdminQueueItem {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  customer: {
    name: string
    email: string
  }
  position: number
  estimatedWaitMinutes: number
}

export interface AdminQueueResponse {
  total: number
  queue: AdminQueueItem[]
}

// ============================================================
// Payload Imports (from Phase 2 domain schemas)
// ============================================================

export type {
  InviteUserInput,
  UpdateUserInput,
  BanUserInput,
  AuditLogFilters,
} from '@/features/admin/schemas'

// Re-export for backwards compatibility
export type AdminUserType = AdminUser
export type TechnicianType = Technician
export type AuditLogType = AuditLog
export type QueueStatsType = QueueStats

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  phone?: string
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  phone?: string
  role?: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
  isBanned?: boolean
}

// ============================================================
// Raw Execution Functions
// ============================================================

type AdminUserApiResponse = Omit<AdminUser, 'lastLoginAt'> & {
  lastLoginAt?: string | null
}

type UserEnvelope = AdminUserApiResponse | { user: AdminUserApiResponse }
type UsersEnvelope = AdminUserApiResponse[] | { users: AdminUserApiResponse[] }
type PasswordResetEnvelope =
  | { temporaryPassword: string }
  | { temporaryPassword?: string; message?: string }

function normalizeAdminUser(user: AdminUserApiResponse): AdminUser {
  return {
    ...user,
    lastLoginAt: user.lastLoginAt ?? null,
  }
}

function unwrapUser(response: UserEnvelope): AdminUser {
  const user = 'user' in response ? response.user : response
  return normalizeAdminUser(user)
}

function unwrapUsers(response: UsersEnvelope): AdminUser[] {
  const users = Array.isArray(response) ? response : response.users
  return users.map(normalizeAdminUser)
}

async function getQueue(): Promise<QueueStats> {
  return fetcher<QueueStats>('/api/admin/queue')
}

async function getTechnicians(): Promise<Technician[]> {
  return fetcher<Technician[]>('/api/technicians')
}

async function getUsers(): Promise<AdminUser[]> {
  const response = await fetcher<UsersEnvelope>('/api/admin/users')
  return unwrapUsers(response)
}

async function createUser(data: CreateUserPayload): Promise<AdminUser> {
  const response = await fetcher<UserEnvelope>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return unwrapUser(response)
}

async function getUser(id: string): Promise<AdminUser> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}`)
  return unwrapUser(response)
}

async function updateUser(id: string, data: UpdateUserPayload): Promise<AdminUser> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return unwrapUser(response)
}

async function deleteUser(id: string): Promise<void> {
  return fetcher<void>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })
}

async function banUser(id: string): Promise<AdminUser> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}/ban`, {
    method: 'POST',
  })
  return unwrapUser(response)
}

async function unbanUser(id: string): Promise<AdminUser> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}/unban`, {
    method: 'POST',
  })
  return unwrapUser(response)
}

async function resetUserPassword(id: string): Promise<PasswordResetEnvelope> {
  return fetcher<PasswordResetEnvelope>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
  })
}

async function getAuditLogs(page = 1, limit = 25): Promise<AuditLogsResponse> {
  return fetcher<AuditLogsResponse>(`/api/admin/audit?page=${page}&limit=${limit}`)
}

async function getAdminQueue(): Promise<AdminQueueResponse> {
  return fetcher<AdminQueueResponse>('/api/admin/queue')
}

// ============================================================
// Hooks Object Definition
// ============================================================

export const adminApi = {
  /**
   * Fetch queue statistics for admin dashboard
   */
  getQueue: {
    useQuery: (options?: UseQueryOptions<QueueStats, Error, QueueStats, string[]>) =>
      useQuery({
        queryKey: ['admin', 'queue'],
        queryFn: getQueue,
        meta: { errorMessage: 'Failed to load queue stats.' },
        ...options,
      }),
  },

  /**
   * Fetch detailed admin queue with ticket items
   */
  getAdminQueue: {
    useQuery: (options?: UseQueryOptions<AdminQueueResponse, Error, AdminQueueResponse, string[]>) =>
      useQuery({
        queryKey: ['admin', 'admin-queue'],
        queryFn: getAdminQueue,
        meta: { errorMessage: 'Failed to load admin queue.' },
        ...options,
      }),
  },

  /**
   * Fetch all technicians for assignment
   */
  getTechnicians: {
    useQuery: (options?: UseQueryOptions<Technician[], Error, Technician[], string[]>) =>
      useQuery({
        queryKey: ['admin', 'technicians'],
        queryFn: getTechnicians,
        meta: { errorMessage: 'Failed to load technicians.' },
        ...options,
      }),
  },

  /**
   * Fetch all users (admin only)
   */
  getUsers: {
    useQuery: (options?: UseQueryOptions<AdminUser[], Error, AdminUser[], string[]>) =>
      useQuery({
        queryKey: ['admin', 'users'],
        queryFn: getUsers,
        meta: { errorMessage: 'Failed to load users.' },
        ...options,
      }),
  },

  /**
   * Create/invite a new user
   * Automatically invalidates users cache on success
   */
  createUser: {
    useMutation: (options?: UseMutationOptions<AdminUser, Error, CreateUserPayload>) =>
      useMutation({
        mutationFn: createUser,
        meta: {
          successMessage: 'User invited successfully.',
          errorMessage: 'Failed to invite user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  /**
   * Fetch a single user by ID
   */
  getUser: {
    useQuery: (id: string, options?: UseQueryOptions<AdminUser, Error, AdminUser, string[]>) =>
      useQuery({
        queryKey: ['admin', 'user', id],
        queryFn: () => getUser(id),
        meta: { errorMessage: 'Failed to load user.' },
        enabled: !!id,
        ...options,
      }),
  },

  /**
   * Update user information
   * Automatically invalidates users cache on success
   */
  updateUser: {
    useMutation: (options?: UseMutationOptions<AdminUser, Error, { id: string; data: UpdateUserPayload }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        meta: {
          successMessage: 'User updated successfully.',
          errorMessage: 'Failed to update user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  /**
   * Delete a user permanently
   * Automatically invalidates users cache on success
   */
  deleteUser: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: deleteUser,
        meta: {
          successMessage: 'User deleted successfully.',
          errorMessage: 'Failed to delete user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  /**
   * Ban a user
   * Automatically invalidates users cache on success
   */
  banUser: {
    useMutation: (options?: UseMutationOptions<AdminUser, Error, string>) =>
      useMutation({
        mutationFn: banUser,
        meta: {
          successMessage: 'User banned successfully.',
          errorMessage: 'Failed to ban user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  /**
   * Unban a user
   * Automatically invalidates users cache on success
   */
  unbanUser: {
    useMutation: (options?: UseMutationOptions<AdminUser, Error, string>) =>
      useMutation({
        mutationFn: unbanUser,
        meta: {
          successMessage: 'User unbanned successfully.',
          errorMessage: 'Failed to unban user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  /**
   * Reset user password (admin initiated)
   */
  resetUserPassword: {
    useMutation: (options?: UseMutationOptions<PasswordResetEnvelope, Error, string>) =>
      useMutation({
        mutationFn: resetUserPassword,
        meta: {
          successMessage: 'Password reset email sent.',
          errorMessage: 'Failed to reset password.',
        },
        ...options,
      }),
  },

  /**
   * Fetch audit logs with pagination
   */
  getAuditLogs: {
    useQuery: (options?: UseQueryOptions<AuditLogsResponse, Error, AuditLogsResponse, string[]>) =>
      useQuery({
        queryKey: ['admin', 'audit-logs', '1', '25'],
        queryFn: () => getAuditLogs(1, 25),
        meta: { errorMessage: 'Failed to load audit logs.' },
        ...options,
      }),

    usePaginated: (page: number, limit: number, options?: UseQueryOptions<AuditLogsResponse, Error, AuditLogsResponse, string[]>) =>
      useQuery({
        queryKey: ['admin', 'audit-logs', String(page), String(limit)],
        queryFn: () => getAuditLogs(page, limit),
        meta: { errorMessage: 'Failed to load audit logs.' },
        ...options,
      }),
  },
}

// ============================================================
// Default Export
// ============================================================

export default adminApi
