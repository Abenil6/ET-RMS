import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from './useFetch'

const mockFetcher = vi.fn()

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load data on mount', async () => {
    mockFetcher.mockResolvedValue({ id: 1, name: 'Test' })

    const { result } = renderHook(() => useFetch(mockFetcher, []))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual({ id: 1, name: 'Test' })
    expect(result.current.error).toBeNull()
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should handle errors', async () => {
    mockFetcher.mockRejectedValue(new Error('Failed to fetch'))

    const { result } = renderHook(() => useFetch(mockFetcher, []))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Failed to fetch')
  })

  it('should refresh data manually', async () => {
    mockFetcher.mockResolvedValue({ id: 1, name: 'Test' })

    const { result } = renderHook(() => useFetch(mockFetcher, []))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetcher).toHaveBeenCalledTimes(1)

    mockFetcher.mockResolvedValue({ id: 2, name: 'Updated' })
    await result.current.refresh()

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2, name: 'Updated' })
    })

    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })

  it('should keep loading false during refresh when data exists', async () => {
    mockFetcher.mockResolvedValue({ id: 1, name: 'Test' })

    const { result } = renderHook(() => useFetch(mockFetcher, []))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const refreshPromise = result.current.refresh()
    expect(result.current.loading).toBe(false)

    await refreshPromise
  })
})
