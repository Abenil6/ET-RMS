import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import api from '@/apis'
import type { Notification } from '@/lib/types'

export function useNotifications() {
  const navigate = useNavigate()
  const notifRef = useRef<HTMLDivElement>(null)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const { data: notifications = [], isLoading: notifLoading, error: notifError, refetch: loadNotifications } =
    api.Notifications.getAll.useQuery()

  const { data: unreadCount = 0 } =
    api.Notifications.getUnreadCount.useQuery()

  const { mutate: markAsRead } = api.Notifications.markAsRead.useMutation()
  const { mutate: markAllAsRead } = api.Notifications.markAllAsRead.useMutation()

  // Click-outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotifOpen])

  const formatNotifTime = useCallback((iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-ET', { dateStyle: 'medium', timeStyle: 'short' })
  }, [])

  const handleNotificationClick = useCallback((n: Notification) => {
    if (!n.read) markAsRead(n.id)
    if (n.ticketId) {
      navigate({ to: '/tickets/$ticketId', params: { ticketId: n.ticketId } })
      setIsNotifOpen(false)
    }
  }, [markAsRead, navigate])

  return {
    notifRef,
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    notifLoading,
    notifError,
    loadNotifications,
    unreadCount,
    markAllAsRead,
    formatNotifTime,
    handleNotificationClick,
  }
}
