import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export type QueueInfo = {
  ticketNumber: string
  status: string
  position: number
  ahead: number
  estimatedWaitMinutes: number
}

export function useQueuePosition(
  ticketId: string | null | undefined,
  enabled: boolean,
  intervalMs = 30000
) {
  const [queue, setQueue] = useState<QueueInfo | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!ticketId) return
    try {
      const data = await api.tickets.getQueue(ticketId)
      setQueue(data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue.')
    }
  }, [ticketId])

  useEffect(() => {
    if (!enabled || !ticketId) {
      setQueue(null)
      setLastUpdated(null)
      return
    }
    void refresh()
    const id = setInterval(() => void refresh(), intervalMs)
    return () => clearInterval(id)
  }, [enabled, ticketId, intervalMs, refresh])

  return { queue, error, lastUpdated, refresh }
}
