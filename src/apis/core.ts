import axios from 'axios'

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * TanStack Start supports SSR.
 *
 * localStorage does NOT exist on the server, so we keep the
 * tokens in memory and only read/write localStorage in the browser.
 */
let accessToken: string | null = null
let refreshToken: string | null = null

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function loadTokens(): void {
  if (!isBrowser()) return
  accessToken = window.localStorage.getItem('access_token')
  refreshToken = window.localStorage.getItem('refresh_token')
}

export function saveTokens(access: string, refresh: string): void {
  accessToken = access
  refreshToken = refresh
  if (!isBrowser()) return
  window.localStorage.setItem('access_token', access)
  window.localStorage.setItem('refresh_token', refresh)
}

export function setTokens(access: string, refresh: string): void {
  saveTokens(access, refresh)
}

export function clearTokens(): void {
  accessToken = null
  refreshToken = null
  if (!isBrowser()) return
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
}

export function getAccessToken(): string | null {
  if (accessToken === null && isBrowser()) {
    loadTokens()
  }
  return accessToken
}

export function getRefreshToken(): string | null {
  if (refreshToken === null && isBrowser()) {
    loadTokens()
  }
  return refreshToken
}

type AuthRefreshResponse = {
  accessToken: string
  refreshToken: string
}

/**
 * Automatically refresh access token using raw axios
 * to prevent circular interceptor loops in apiClient.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const currentRefreshToken = getRefreshToken()

  if (!currentRefreshToken) {
    return false
  }

  try {
    const response = await axios.post<{ data?: AuthRefreshResponse }>(
      `${API_BASE}/api/auth/refresh`,
      { refreshToken: currentRefreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = response.data.data

    if (!data || !data.accessToken || !data.refreshToken) {
      clearTokens()
      return false
    }

    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    clearTokens()
    return false
  }
}

/**
 * Generic HTTP fetcher using apiClient
 * This is the execution engine for all API calls
 */
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const { apiClient } = await import('./apiClient')
  
  const config = {
    url,
    method: options?.method || 'GET',
    ...(options?.body && { data: options.body }),
    headers: options?.headers as Record<string, string>,
  }

  const response = await apiClient.request<T>(config)
  return response.data
}
