import { useCallback, useEffect, useRef, useState } from 'react'
import type { DependencyList } from 'react'

type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: s.data === null, error: null }))
    try {
      const data = await fetcherRef.current()
      setState({ data, loading: false, error: null })
      return true
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load.',
      }))
      return false
    }
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ...state, refresh: load }
}
