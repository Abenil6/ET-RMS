import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { request } from './core'
import { queryClient } from './queryClient'
import type { Notification } from '@/types/notification'

export type { Notification }
export type NotificationType = Notification

async function getAllNotifications(unreadOnly = false): Promise<Notification[]> {
  return request<Notification[]>(`/api/notifications${unreadOnly ? '?unread=1' : ''}`)
}

async function getUnreadCount(): Promise<number> {
  const unread = await getAllNotifications(true)
  return unread.length
}

async function markAsRead(id: string): Promise<void> {
  return request<void>(`/api/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read: true }),
  })
}

async function markAllAsRead(): Promise<void> {
  const unread = await getAllNotifications(true)
  await Promise.all(unread.map((notification) => markAsRead(notification.id)))
}

export const notificationsApi = {
  getAll: {
    useQuery: (options?: UseQueryOptions<Notification[], Error, Notification[], string[]>) =>
      useQuery({
        queryKey: ['notifications'],
        queryFn: () => getAllNotifications(),
        meta: { errorMessage: 'Failed to load notifications.' },
        ...options,
      }),
  },

  getUnreadCount: {
    useQuery: (options?: UseQueryOptions<number, Error, number, string[]>) =>
      useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: getUnreadCount,
        meta: { errorMessage: 'Failed to load unread count.' },
        staleTime: 0,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
        ...options,
      }),
  },

  markAsRead: {
    useMutation: (options?: UseMutationOptions<void, Error, string>) =>
      useMutation({
        mutationFn: markAsRead,
        meta: {
          successMessage: 'Notification marked as read.',
          errorMessage: 'Failed to mark as read.',
        },
        onMutate: async (id) => {
          await queryClient.cancelQueries({ queryKey: ['notifications'] })
          const previous = queryClient.getQueryData<Notification[]>(['notifications'])
          if (previous) {
            queryClient.setQueryData<Notification[]>(
              ['notifications'],
              previous.map((n) => (n.id === id ? { ...n, read: true } : n)),
            )
          }
          const prevCount = queryClient.getQueryData<number>(['notifications', 'unread'])
          if (prevCount) {
            queryClient.setQueryData(['notifications', 'unread'], Math.max(0, prevCount - 1))
          }
          return { previous, prevCount } as { previous: Notification[] | undefined; prevCount: number | undefined }
        },
        onError: (_err, _id, context) => {
          if (context && typeof context === 'object' && 'previous' in context && context.previous) {
            queryClient.setQueryData(['notifications'], context.previous)
          }
          if (context && typeof context === 'object' && 'prevCount' in context && context.prevCount !== undefined) {
            queryClient.setQueryData(['notifications', 'unread'], context.prevCount)
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
        ...options,
      }),
  },

  markAllAsRead: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: markAllAsRead,
        meta: {
          successMessage: 'All notifications marked as read.',
          errorMessage: 'Failed to mark all as read.',
        },
        onMutate: async () => {
          await queryClient.cancelQueries({ queryKey: ['notifications'] })
          const previous = queryClient.getQueryData<Notification[]>(['notifications'])
          if (previous) {
            queryClient.setQueryData<Notification[]>(
              ['notifications'],
              previous.map((n) => ({ ...n, read: true })),
            )
          }
          queryClient.setQueryData(['notifications', 'unread'], 0)
          return { previous } as { previous: Notification[] | undefined }
        },
        onError: (_err, _vars, context) => {
          if (context && typeof context === 'object' && 'previous' in context && context.previous) {
            queryClient.setQueryData(['notifications'], context.previous)
          }
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
        ...options,
      }),
  },
}

export default notificationsApi
