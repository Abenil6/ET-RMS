import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQueuePosition } from './useQueuePosition'
import { api } from './api'

vi.mock('./api', () => ({
  api: {
    tickets: {
      getQueue: vi.fn(),
    },
  },
}))

describe('useQueuePosition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch queue data when enabled', async () => {
    const mockQueue = {
      ticketNumber: 'TKT-001',
      status: 'OPEN',
      position: 5,
      ahead: 4,
      estimatedWaitMinutes: 20,
    }

    vi.mocked(api.tickets.getQueue).mockResolvedValue(mockQueue)

    const { result } = renderHook(() => useQueuePosition('ticket-1', true, 30000))

    expect(result.current.queue).toBeNull()

    await waitFor(() => {
      expect(result.current.queue).toEqual(mockQueue)
    })

    expect(api.tickets.getQueue).toHaveBeenCalledWith('ticket-1')
  })

  it('should not fetch when disabled', () => {
    const { result } = renderHook(() => useQueuePosition('ticket-1', false, 30000))

    expect(result.current.queue).toBeNull()
    expect(api.tickets.getQueue).not.toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    vi.mocked(api.tickets.getQueue).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useQueuePosition('ticket-1', true, 30000))

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })

    expect(result.current.queue).toBeNull()
  })
})

