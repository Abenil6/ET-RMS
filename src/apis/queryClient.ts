import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) {
        toast.error(query.meta.errorMessage)
      } else {
        toast.error(`Something went wrong: ${error.message}`)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.errorMessage) {
        toast.error(mutation.meta.errorMessage)
      } else {
        toast.error(`Something went wrong: ${error.message}`)
      }
    },
    onSuccess: (_data, _variables, _context, mutation ) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage)
      }
      if (mutation.meta?.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: mutation.meta.invalidateQueries })
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // stale time is configured for unnecessary refetches, but can be overridden in individual queries
      gcTime: 1000 * 60 * 30, // caches are garbage collected after 30 minutes of inactivity
      retry: 1, // retry failed queries once before throwing an error
      refetchOnWindowFocus: false, // disable refetching on window focus to avoid unnecessary network requests
    },
  },
})