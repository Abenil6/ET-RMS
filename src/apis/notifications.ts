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

async function getNotificationsFn(unreadOnly = false): Promise<Notification[]> {
  return fetcher<Notification[]>(
    `/api/notifications${unreadOnly ? '?unread=1' : ''}`,
  )
}

async function getUnreadCountFn(): Promise<number> {
  const unread = await getNotificationsFn(true)
  return unread.length
}

async function markAsReadFn(id: string): Promise<void> {
  return fetcher<void>(`/api/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read: true }),
  })
}

async function markAllAsReadFn(): Promise<void> {
  const unread = await getNotificationsFn(true)
  await Promise.all(unread.map((notification) => markAsReadFn(notification.id)))
}

// ============================================================
// Typed Hooks
// ============================================================

export const notificationsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Notification[], Error, Notification[], string[]>) =>
      useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotificationsFn(),
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
          invalidateQueries: ['notifications'],
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
          invalidateQueries: ['notifications'],
        },
        ...options,
      }),
  },
}
