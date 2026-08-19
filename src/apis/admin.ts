import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'
import type { User, Role } from '../lib/types'

// ============================================================
// Types
// ============================================================

export type AdminUserType = User & {
  isBanned: boolean
  banned?: boolean
  bannedAt?: string | null
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

export interface AuditLogPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AuditLogsResponse {
  logs: AuditLogType[]
  pagination: AuditLogPagination
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

// Queue management types
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

type AdminUserApiResponse = Omit<AdminUserType, 'isBanned' | 'lastLoginAt'> & {
  isBanned?: boolean
  banned?: boolean
  lastLoginAt?: string | null
}

type UserEnvelope = AdminUserApiResponse | { user: AdminUserApiResponse }
type UsersEnvelope = AdminUserApiResponse[] | { users: AdminUserApiResponse[] }
type PasswordResetEnvelope =
  | { temporaryPassword: string }
  | { temporaryPassword?: string; message?: string }

function normalizeAdminUser(user: AdminUserApiResponse): AdminUserType {
  return {
    ...user,
    isBanned: Boolean(user.isBanned ?? user.banned),
    lastLoginAt: user.lastLoginAt ?? null,
  }
}

function unwrapUser(response: UserEnvelope): AdminUserType {
  const user = 'user' in response ? response.user : response
  return normalizeAdminUser(user)
}

function unwrapUsers(response: UsersEnvelope): AdminUserType[] {
  const users = Array.isArray(response) ? response : response.users
  return users.map(normalizeAdminUser)
}

// ============================================================
// Raw API Functions
// ============================================================

async function getQueueFn(): Promise<QueueStatsType> {
  return fetcher<QueueStatsType>('/api/admin/queue')
}

async function getTechniciansFn(): Promise<TechnicianType[]> {
  return fetcher<TechnicianType[]>('/api/technicians')
}

async function getUsersFn(): Promise<AdminUserType[]> {
  const response = await fetcher<UsersEnvelope>('/api/admin/users')
  return unwrapUsers(response)
}

async function createUserFn(data: CreateUserPayload): Promise<AdminUserType> {
  const response = await fetcher<UserEnvelope>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return unwrapUser(response)
}

async function getUserFn(id: string): Promise<AdminUserType> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}`)
  return unwrapUser(response)
}

async function updateUserFn(id: string, data: UpdateUserPayload): Promise<AdminUserType> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return unwrapUser(response)
}

async function deleteUserFn(id: string): Promise<void> {
  return fetcher<void>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })
}

async function banUserFn(id: string): Promise<AdminUserType> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}/ban`, {
    method: 'POST',
  })
  return unwrapUser(response)
}

async function unbanUserFn(id: string): Promise<AdminUserType> {
  const response = await fetcher<UserEnvelope>(`/api/admin/users/${id}/unban`, {
    method: 'POST',
  })
  return unwrapUser(response)
}

async function resetUserPasswordFn(id: string): Promise<PasswordResetEnvelope> {
  return fetcher<PasswordResetEnvelope>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
  })
}

async function getAuditLogsFn(page = 1, limit = 25): Promise<AuditLogsResponse> {
  return fetcher<AuditLogsResponse>(`/api/admin/audit?page=${page}&limit=${limit}`)
}

async function getAdminQueueFn(): Promise<AdminQueueResponse> {
  return fetcher<AdminQueueResponse>('/api/admin/queue')
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

  getAdminQueue: {
    useQuery: (options?: UseQueryOptions<AdminQueueResponse, Error, AdminQueueResponse, string[]>) =>
      useQuery({
        queryKey: ['admin', 'admin-queue'],
        queryFn: getAdminQueueFn,
        meta: { errorMessage: 'Failed to load admin queue.' },
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
        queryKey: ['admin', 'user', id],
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
        mutationFn: deleteUserFn,
        meta: {
          successMessage: 'User deleted successfully.',
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
          successMessage: 'User banned successfully.',
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
        mutationFn: resetUserPasswordFn,
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
        queryFn: () => getAuditLogsFn(1, 25),
        meta: { errorMessage: 'Failed to load audit logs.' },
        ...options,
      }),

    usePaginated: (page: number, limit: number, options?: UseQueryOptions<AuditLogsResponse, Error, AuditLogsResponse, string[]>) =>
      useQuery({
        queryKey: ['admin', 'audit-logs', String(page), String(limit)],
        queryFn: () => getAuditLogsFn(page, limit),
        meta: { errorMessage: 'Failed to load audit logs.' },
        ...options,
      }),
  },
}
