import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'
import type { User, Role } from '../lib/types'

// ============================================================
// Types
// ============================================================

export type AdminUserType = User & {
  isBanned: boolean
  lastLoginAt: string | null
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  phone?: string
  role: Role
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  role?: Role
  isBanned?: boolean
}

export interface AuditLogType {
  id: string
  userId: string
  action: string
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface QueueStatsType {
  total: number
  open: number
  inProgress: number
  resolved: number
  averageWaitTime: number
}

export interface TechnicianType {
  id: string
  name: string
  email: string
  openTickets?: number
  activeTickets?: number
}

// ============================================================
// Raw API Functions
// ============================================================

async function getQueueFn(): Promise<QueueStatsType> {
  return fetcher<QueueStatsType>('/api/admin/queue')
}

async function getTechniciansFn(): Promise<TechnicianType[]> {
  return fetcher<TechnicianType[]>('/api/admin/technicians')
}

async function getUsersFn(): Promise<AdminUserType[]> {
  return fetcher<AdminUserType[]>('/api/admin/users')
}

async function createUserFn(data: CreateUserPayload): Promise<AdminUserType> {
  return fetcher<AdminUserType>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function getUserFn(id: string): Promise<AdminUserType> {
  return fetcher<AdminUserType>(`/api/admin/users/${id}`)
}

async function updateUserFn(id: string, data: UpdateUserPayload): Promise<AdminUserType> {
  return fetcher<AdminUserType>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

async function deleteUserFn(id: string): Promise<void> {
  return fetcher<void>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })
}

async function banUserFn(id: string): Promise<AdminUserType> {
  return fetcher<AdminUserType>(`/api/admin/users/${id}/ban`, {
    method: 'POST',
  })
}

async function unbanUserFn(id: string): Promise<AdminUserType> {
  return fetcher<AdminUserType>(`/api/admin/users/${id}/unban`, {
    method: 'POST',
  })
}

async function resetUserPasswordFn(id: string): Promise<{ temporaryPassword: string }> {
  return fetcher<{ temporaryPassword: string }>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
  })
}

async function getAuditLogsFn(): Promise<AuditLogType[]> {
  return fetcher<AuditLogType[]>('/api/admin/audit-logs')
}

// ============================================================
// Typed Hooks
// ============================================================

export const adminApi = {
  getQueue: {
    useQuery: (options?: UseQueryOptions<QueueStatsType, Error, QueueStatsType, string[]>) =>
      useQuery({
        queryKey: ['admin', 'queue'],
        queryFn: getQueueFn,
        meta: { errorMessage: 'Failed to load queue stats.' },
        ...options,
      }),
  },

  getTechnicians: {
    useQuery: (options?: UseQueryOptions<TechnicianType[], Error, TechnicianType[], string[]>) =>
      useQuery({
        queryKey: ['admin', 'technicians'],
        queryFn: getTechniciansFn,
        meta: { errorMessage: 'Failed to load technicians.' },
        ...options,
      }),
  },

  getUsers: {
    useQuery: (options?: UseQueryOptions<AdminUserType[], Error, AdminUserType[], string[]>) =>
      useQuery({
        queryKey: ['admin', 'users'],
        queryFn: getUsersFn,
        meta: { errorMessage: 'Failed to load users.' },
        ...options,
      }),
  },

  createUser: {
    useMutation: (options?: UseMutationOptions<AdminUserType, Error, CreateUserPayload>) =>
      useMutation({
        mutationFn: createUserFn,
        meta: {
          successMessage: 'User invited successfully.',
          errorMessage: 'Failed to invite user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  getUser: {
    useQuery: (id: string, options?: UseQueryOptions<AdminUserType, Error, AdminUserType, string[]>) =>
      useQuery({
        queryKey: ['admin', 'users', id],
        queryFn: () => getUserFn(id),
        meta: { errorMessage: 'Failed to load user.' },
        enabled: !!id,
        ...options,
      }),
  },

  updateUser: {
    useMutation: (options?: UseMutationOptions<AdminUserType, Error, { id: string; data: UpdateUserPayload }>) =>
      useMutation({
        mutationFn: ({ id, data }) => updateUserFn(id, data),
        meta: {
          successMessage: 'User updated.',
          errorMessage: 'Failed to update user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  deleteUser: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: deleteUserFn,
        meta: {
          successMessage: 'User deleted.',
          errorMessage: 'Failed to delete user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  banUser: {
    useMutation: (options?: UseMutationOptions<AdminUserType, Error, string>) =>
      useMutation({
        mutationFn: banUserFn,
        meta: {
          successMessage: 'User banned.',
          errorMessage: 'Failed to ban user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  unbanUser: {
    useMutation: (options?: UseMutationOptions<AdminUserType, Error, string>) =>
      useMutation({
        mutationFn: unbanUserFn,
        meta: {
          successMessage: 'User unbanned.',
          errorMessage: 'Failed to unban user.',
          invalidateQueries: ['admin', 'users'],
        },
        ...options,
      }),
  },

  resetUserPassword: {
    useMutation: (options?: UseMutationOptions<{ temporaryPassword: string }, Error, string>) =>
      useMutation({
        mutationFn: resetUserPasswordFn,
        meta: {
          successMessage: 'Password reset email sent.',
          errorMessage: 'Failed to reset password.',
        },
        ...options,
      }),
  },

  getAuditLogs: {
    useQuery: (options?: UseQueryOptions<AuditLogType[], Error, AuditLogType[], string[]>) =>
      useQuery({
        queryKey: ['admin', 'audit'],
        queryFn: getAuditLogsFn,
        meta: { errorMessage: 'Failed to load audit logs.' },
        ...options,
      }),
  },
}
