import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'
import type { Notification } from '../lib/types'

// ============================================================
// Types
// ============================================================

export type NotificationType = Notification

// ============================================================
// Raw API Functions
// ============================================================

async function getNotificationsFn(): Promise<Notification[]> {
  return fetcher<Notification[]>('/api/notifications')
}

async function getUnreadCountFn(): Promise<number> {
  const result = await fetcher<{ count: number }>('/api/notifications/unread-count')
  return result.count
}

async function markAsReadFn(id: string): Promise<void> {
  return fetcher<void>(`/api/notifications/${id}/read`, {
    method: 'POST',
  })
}

async function markAllAsReadFn(): Promise<void> {
  return fetcher<void>('/api/notifications/read-all', {
    method: 'POST',
  })
}

// ============================================================
// Typed Hooks
// ============================================================

export const notificationsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Notification[], Error, Notification[], string[]>) =>
      useQuery({
        queryKey: ['notifications'],
        queryFn: getNotificationsFn,
        meta: { errorMessage: 'Failed to load notifications.' },
        ...options,
      }),
  },

  getUnreadCount: {
    useQuery: (options?: UseQueryOptions<number, Error, number, string[]>) =>
      useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: getUnreadCountFn,
        meta: { errorMessage: 'Failed to load unread count.' },
        refetchInterval: 30000, // Poll every 30s
        ...options,
      }),
  },

  markAsRead: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: markAsReadFn,
        meta: {
          successMessage: 'Notification marked as read.',
          errorMessage: 'Failed to mark as read.',
          invalidateQueries: ['notifications', 'notifications', 'unread'],
        },
        ...options,
      }),
  },

  markAllAsRead: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: markAllAsReadFn,
        meta: {
          successMessage: 'All notifications marked as read.',
          errorMessage: 'Failed to mark all as read.',
          invalidateQueries: ['notifications', 'notifications', 'unread'],
        },
        ...options,
      }),
  },
}
