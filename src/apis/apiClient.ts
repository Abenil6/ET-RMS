import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import {
  API_BASE,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  clearTokens,
  ApiError,
} from './core'

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Concurrency queue state for managing simultaneous 401s
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 1. REQUEST INTERCEPTOR: Inject Bearer token from core.ts
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 2. RESPONSE INTERCEPTOR: handle 401 refresh flow and normalize errors.
// Successful response unwrapping belongs in core request<T>().
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string; errors?: Record<string, string[]> }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized errors
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      // If no refresh token exists in core.ts, reject immediately
      if (!getRefreshToken()) {
        clearTokens()
        return Promise.reject(new ApiError(401, 'Session expired'))
      }

      // Queue parallel failed requests while a refresh is in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Delegate token refresh execution directly to core.ts
        const refreshed = await refreshAccessToken()

        if (!refreshed) {
          throw new ApiError(401, 'Session expired')
        }

        const newAccessToken = getAccessToken()
        processQueue(null, newAccessToken)

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        return Promise.reject(
          refreshError instanceof ApiError
            ? refreshError
            : new ApiError(401, 'Session expired')
        )
      } finally {
        isRefreshing = false
      }
    }

    // Standard ApiError conversion matching your custom error structure
    const status = error.response?.status ?? 0
    const body = error.response?.data

    return Promise.reject(
      new ApiError(
        status,
        body?.error || body?.message || error.message || 'Network error',
        body?.errors
      )
    )
  }
)
