import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { request } from './core'
import type { AdminUser } from '@/types/user'
import type { Technician } from '@/types/tickets'
import type {
  AuditLog,
  QueueStats,
  AdminQueueItem,
  AdminQueueResponse,
} from '@/types/admin'
import type { CreateUserPayload, UpdateUserPayload } from '@/types/user'
import type { PaginationMeta } from '@/types/core'

export type { AdminUser, Technician, AuditLog, QueueStats, AdminQueueItem, AdminQueueResponse }
export type {
  InviteUserInput,
  UpdateUserInput,
  BanUserInput,
  AuditLogFilters,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/types/admin'

export type AdminUserType = AdminUser
export type TechnicianType = Technician
export type AuditLogType = AuditLog
export type QueueStatsType = QueueStats

export interface AuditLogPagination extends PaginationMeta {}

export interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: AuditLogPagination
}

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
  return request<QueueStats>('/api/admin/queue')
}

async function getTechnicians(): Promise<Technician[]> {
  return request<Technician[]>('/api/technicians')
}

async function getUsers(): Promise<AdminUser[]> {
  const response = await request<UsersEnvelope>('/api/admin/users')
  return unwrapUsers(response)
}

async function createUser(data: CreateUserPayload): Promise<AdminUser> {
  const response = await request<UserEnvelope>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return unwrapUser(response)
}

async function getUser(id: string): Promise<AdminUser> {
  const response = await request<UserEnvelope>(`/api/admin/users/${id}`)
  return unwrapUser(response)
}

async function updateUser(id: string, data: UpdateUserPayload): Promise<AdminUser> {
  const response = await request<UserEnvelope>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return unwrapUser(response)
}

async function deleteUser(id: string): Promise<void> {
  return request<void>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })
}

async function banUser(id: string): Promise<AdminUser> {
  const response = await request<UserEnvelope>(`/api/admin/users/${id}/ban`, {
    method: 'POST',
  })
  return unwrapUser(response)
}

async function unbanUser(id: string): Promise<AdminUser> {
  const response = await request<UserEnvelope>(`/api/admin/users/${id}/unban`, {
    method: 'POST',
  })
  return unwrapUser(response)
}

async function resetUserPassword(id: string): Promise<PasswordResetEnvelope> {
  return request<PasswordResetEnvelope>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
  })
}

async function getAuditLogs(page = 1, limit = 25): Promise<AuditLogsResponse> {
  return request<AuditLogsResponse>(`/api/admin/audit?page=${page}&limit=${limit}`)
}

async function getAdminQueue(): Promise<AdminQueueResponse> {
  return request<AdminQueueResponse>('/api/admin/queue')
}

export const adminApi = {
  getQueue: {
    useQuery: (options?: UseQueryOptions<QueueStats, Error, QueueStats, string[]>) =>
      useQuery({
        queryKey: ['admin', 'queue'],
        queryFn: getQueue,
        meta: { errorMessage: 'Failed to load queue stats.' },
        staleTime: 1000 * 30,
        ...options,
      }),
  },

  getAdminQueue: {
    useQuery: (options?: UseQueryOptions<AdminQueueResponse, Error, AdminQueueResponse, string[]>) =>
      useQuery({
        queryKey: ['admin', 'admin-queue'],
        queryFn: getAdminQueue,
        meta: { errorMessage: 'Failed to load admin queue.' },
        staleTime: 1000 * 30,
        ...options,
      }),
  },

  getTechnicians: {
    useQuery: (options?: UseQueryOptions<Technician[], Error, Technician[], string[]>) =>
      useQuery({
        queryKey: ['technicians'],
        queryFn: getTechnicians,
        meta: { errorMessage: 'Failed to load technicians.' },
        staleTime: 1000 * 60 * 10,
        ...options,
      }),
  },

  getUsers: {
    useQuery: (options?: UseQueryOptions<AdminUser[], Error, AdminUser[], string[]>) =>
      useQuery({
        queryKey: ['admin', 'users'],
        queryFn: getUsers,
        meta: { errorMessage: 'Failed to load users.' },
        ...options,
      }),
  },

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

export default adminApi
