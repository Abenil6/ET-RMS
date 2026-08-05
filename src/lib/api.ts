const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiError extends Error {
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

function getRefreshToken() {
  if (refreshToken === null && isBrowser()) {
    loadTokens()
  }

  return refreshToken
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
 * Generic API fetcher.
 */
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Make sure browser tokens are loaded before making the request.
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

export const api = {
  // ============================================================
  // AUTH
  // ============================================================

  auth: {
    login: async (email: string, password: string) => {
      const data = await fetcher<{
        accessToken: string
        refreshToken: string
        user: any
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      setTokens(data.accessToken, data.refreshToken)

      return data.user
    },

    register: async (params: {
      name: string
      email: string
      password: string
      phone?: string
    }) => {
      const data = await fetcher<{
        accessToken: string
        refreshToken: string
        user: any
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
      })

      setTokens(data.accessToken, data.refreshToken)

      return data.user
    },

    logout: async () => {
      const currentRefreshToken = getRefreshToken()

      if (!currentRefreshToken) {
        clearTokens()
        return
      }

      try {
        await fetcher<{ loggedOut: boolean }>('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({
            refreshToken: currentRefreshToken,
          }),
        })
      } finally {
        clearTokens()
      }
    },

    me: () => fetcher<any>('/api/auth/me'),

    updateProfile: (data: {
      name?: string
      email?: string
      phone?: string
    }) =>
      fetcher<any>('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    changePassword: (
      currentPassword: string,
      newPassword: string,
    ) =>
      fetcher<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }),

    deleteAccount: () =>
      fetcher<void>('/api/auth/me', {
        method: 'DELETE',
      }),

    forgotPassword: (email: string) =>
      fetcher<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email,
        }),
      }),

    resetPassword: (
      token: string,
      newPassword: string,
    ) =>
      fetcher<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword,
        }),
      }),
  },

  // ============================================================
  // TICKETS
  // ============================================================

  tickets: {
    getAll: () =>
      fetcher<any[]>('/api/tickets'),

    getById: (id: string) =>
      fetcher<any>(`/api/tickets/${id}`),

    create: (data: {
      subject: string
      serviceNumber: string
      description: string
      category: string
      priority: string
    }) =>
      fetcher<any>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (
      id: string,
      data: {
        description?: string
        status?: string
        priority?: string
      },
    ) =>
      fetcher<any>(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    getQueue: (id: string) =>
      fetcher<{
        ticketNumber: string
        status: string
        position: number
        ahead: number
        estimatedWaitMinutes: number
      }>(`/api/tickets/${id}/queue`),

    assign: (
      id: string,
      technicianId: string,
    ) =>
      fetcher<any>(`/api/tickets/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          technicianId,
        }),
      }),

    resolve: (
      id: string,
      resolutionNotes: string,
    ) =>
      fetcher<any>(`/api/tickets/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          resolutionNotes,
        }),
      }),

    reopen: (id: string) =>
      fetcher<any>(`/api/tickets/${id}/reopen`, {
        method: 'POST',
      }),

    review: (
      id: string,
      rating: number,
      comment: string,
    ) =>
      fetcher<any>(`/api/tickets/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment,
        }),
      }),
  },

  // ============================================================
  // APPOINTMENTS
  // ============================================================

  appointments: {
    getAll: () =>
      fetcher<any[]>('/api/appointments'),

    create: (data: {
      branch: string
      slotTime: string
      notes?: string
    }) =>
      fetcher<any>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (
      id: string,
      status: 'CANCELLED' | 'COMPLETED',
    ) =>
      fetcher<any>(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
        }),
      }),
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  notifications: {
    getAll: (unreadOnly = false) =>
      fetcher<any[]>(
        `/api/notifications${
          unreadOnly ? '?unread=1' : ''
        }`,
      ),

    markAsRead: (id: string) =>
      fetcher<any>(`/api/notifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          read: true,
        }),
      }),
  },

  // ============================================================
  // ADMIN
  // ============================================================

  admin: {
    getQueue: () =>
      fetcher<{
        total: number
        queue: any[]
      }>('/api/admin/queue'),

    getTechnicians: () =>
      fetcher<any[]>('/api/technicians'),

    // Users
    getUsers: () =>
      fetcher<{ users: any[] }>('/api/admin/users'),

    createUser: (data: {
      name: string
      email: string
      role: 'ADMIN' | 'TECHNICIAN'
    }) =>
      fetcher<{ user: any; message: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getUser: (id: string) =>
      fetcher<{ user: any }>(`/api/admin/users/${id}`),

    updateUser: (
      id: string,
      data: {
        name?: string
        email?: string
        phone?: string
        role?: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
      },
    ) =>
      fetcher<{ user: any }>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteUser: (id: string) =>
      fetcher<{ message: string }>(`/api/admin/users/${id}`, {
        method: 'DELETE',
      }),

    banUser: (id: string) =>
      fetcher<any>(`/api/admin/users/${id}/ban`, {
        method: 'POST',
      }),

    unbanUser: (id: string) =>
      fetcher<any>(`/api/admin/users/${id}/unban`, {
        method: 'POST',
      }),

    resetUserPassword: (id: string) =>
      fetcher<any>(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
      }),

    // Audit log
    getAuditLogs: (page = 1, limit = 25) =>
      fetcher<{
        logs: any[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
      }>(`/api/admin/audit?page=${page}&limit=${limit}`),
  },
}

export { ApiError }