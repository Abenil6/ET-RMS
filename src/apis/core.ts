const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

/**
 * TanStack Start supports SSR.
 *
 * localStorage does NOT exist on the server, so we keep the
 * tokens in memory and only read/write localStorage in the browser.
 */

let accessToken: string | null = null
let refreshToken: string | null = null

function isBrowser() {
  return typeof window !== 'undefined'
}

function loadTokens() {
  if (!isBrowser()) return
  accessToken = window.localStorage.getItem('access_token')
  refreshToken = window.localStorage.getItem('refresh_token')
}

function getRefreshToken() {
  if (refreshToken === null && isBrowser()) {
    loadTokens()
  }
  return refreshToken
}

function saveTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  if (!isBrowser()) return
  window.localStorage.setItem('access_token', access)
  window.localStorage.setItem('refresh_token', refresh)
}

export function setTokens(access: string, refresh: string) {
  saveTokens(access, refresh)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  if (!isBrowser()) return
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
}

export function getAccessToken() {
  if (accessToken === null && isBrowser()) {
    loadTokens()
  }
  return accessToken
}

/**
 * Automatically refresh access token when needed.
 */
async function refreshAccessToken(): Promise<boolean> {
  const currentRefreshToken = getRefreshToken()

  if (!currentRefreshToken) {
    return false
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: currentRefreshToken,
      }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const json = await response.json()

    const data = json.data

    if (!data?.accessToken || !data?.refreshToken) {
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
 * Generic API fetcher with auth + auto token refresh.
 */
export async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (isBrowser() && accessToken === null) {
    loadTokens()
  }

  const makeRequest = async (token: string | null) => {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...options.headers,
      },
    }

    return fetch(`${API_BASE}${endpoint}`, config)
  }

  let response = await makeRequest(accessToken)

  /**
   * If access token expired, try refresh once.
   */
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      response = await makeRequest(accessToken)
    }
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({
        error: 'Network error',
      }))

    throw new ApiError(
      response.status,
      error.error || error.message || `HTTP ${response.status}`,
      error.errors,
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  const json = await response.json()

  return json.data
}
