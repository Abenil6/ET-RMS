/**
 * ============================================================
 * Notifications Resource API
 * Phase 3: Centralized Resource API Layer
 * ============================================================
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher } from './core'

// ============================================================
// Type Imports
// ============================================================

import type { Notification } from '@/types/notification'

// Re-export for convenience
export type { Notification }

// Legacy alias
export type NotificationType = Notification

// ============================================================
// Raw Execution Functions
// ============================================================

async function getAllNotifications(unreadOnly = false): Promise<Notification[]> {
  return fetcher<Notification[]>(`/api/notifications${unreadOnly ? '?unread=1' : ''}`)
}

async function getUnreadCount(): Promise<number> {
  const unread = await getAllNotifications(true)
  return unread.length
}

async function markAsRead(id: string): Promise<void> {
  return fetcher<void>(`/api/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read: true }),
  })
}

async function markAllAsRead(): Promise<void> {
  const unread = await getAllNotifications(true)
  await Promise.all(unread.map((notification) => markAsRead(notification.id)))
}

// ============================================================
// Hooks Object Definition
// ============================================================

export const notificationsApi = {
  /**
   * Fetch all notifications for current user
   */
  getAll: {
    useQuery: (options?: UseQueryOptions<Notification[], Error, Notification[], string[]>) =>
      useQuery({
        queryKey: ['notifications'],
        queryFn: () => getAllNotifications(),
        meta: { errorMessage: 'Failed to load notifications.' },
        ...options,
      }),
  },

  /**
   * Fetch unread notification count
   * Polls every 30 seconds for updates
   */
  getUnreadCount: {
    useQuery: (options?: UseQueryOptions<number, Error, number, string[]>) =>
      useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: getUnreadCount,
        meta: { errorMessage: 'Failed to load unread count.' },
        refetchInterval: 30000,
        ...options,
      }),
  },

  /**
   * Mark a single notification as read
   * Automatically invalidates notifications cache on success
   */
  markAsRead: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: markAsRead,
        meta: {
          successMessage: 'Notification marked as read.',
          errorMessage: 'Failed to mark as read.',
          invalidateQueries: ['notifications'],
        },
        ...options,
      }),
  },

  /**
   * Mark all notifications as read
   * Automatically invalidates notifications cache on success
   */
  markAllAsRead: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: markAllAsRead,
        meta: {
          successMessage: 'All notifications marked as read.',
          errorMessage: 'Failed to mark all as read.',
          invalidateQueries: ['notifications'],
        },
        ...options,
      }),
  },
}

// ============================================================
// Default Export
// ============================================================

export default notificationsApi
