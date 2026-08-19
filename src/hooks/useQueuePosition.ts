import { useCallback } from 'react'
import { ticketsApi } from '@/apis/tickets'

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
  // Use the ticketsApi.getQueue hook which takes ticketId as first param
  const { data: queueData, isError, refetch } = ticketsApi.getQueue.useQuery(
    ticketId || '',
    { 
      enabled: enabled && !!ticketId, 
      refetchInterval: intervalMs 
    }
  )

  const queue = queueData as QueueInfo | undefined
  const error = isError ? 'Failed to load queue.' : null
  const lastUpdated = queueData ? new Date() : null

  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  return { queue, error, lastUpdated, refresh }
}
