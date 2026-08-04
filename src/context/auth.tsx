import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import type { User as ApiUser } from '../lib/types'
import { api, ApiError, clearTokens } from '../lib/api'

export type User = ApiUser & {
  avatarStyle: string
  avatarSeed: string
}

type AuthResult =
  | {
      success: true
    }
  | {
      success: false
      error: string
    }

type AuthContextType = {
  user: User | null
  loading: boolean
  isLoggedIn: boolean

  login: (email: string, password: string) => Promise<AuthResult>

  register: (data: {
    name: string
    email: string
    password: string
    phone?: string
  }) => Promise<AuthResult>

  logout: () => Promise<void>

  updateProfile: (updated: {
    name?: string
    email?: string
    phone?: string
    avatarStyle?: string
    avatarSeed?: string
  }) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * localStorage is browser-only.
 *
 * These helpers make sure we never access localStorage
 * during TanStack Start SSR.
 */

function isBrowser() {
  return typeof window !== 'undefined'
}

function avatarStyleKey(userId: string) {
  return `avatar_style:${userId}`
}

function avatarSeedKey(userId: string) {
  return `avatar_seed:${userId}`
}

function getAvatarStyle(userId: string) {
  if (!isBrowser()) {
    return 'bottts'
  }

  return window.localStorage.getItem(avatarStyleKey(userId)) || 'bottts'
}

function getAvatarSeed(userId: string) {
  if (!isBrowser()) {
    return userId
  }

  return window.localStorage.getItem(avatarSeedKey(userId)) || userId
}

function withAvatar(u: ApiUser): User {
  return {
    ...u,
    avatarStyle: getAvatarStyle(u.id),
    avatarSeed: getAvatarSeed(u.id),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)

  /**
   * Initialize authentication.
   *
   * IMPORTANT:
   * This runs inside useEffect, therefore it only
   * executes in the browser after hydration.
   */
  const init = useCallback(async () => {
    try {
      const me = await api.auth.me()

      setUser(withAvatar(me))
    } catch {
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void init()
  }, [init])

  /**
   * LOGIN
   */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const u = await api.auth.login(email.trim(), password)

        setUser(withAvatar(u))

        /**
         * Re-fetch current user to ensure
         * state is completely synchronized.
         */
        await init()

        return {
          success: true,
        }
      } catch (err) {
        if (err instanceof ApiError) {
          return {
            success: false,
            error: err.message,
          }
        }

        return {
          success: false,
          error: 'Login failed. Please try again.',
        }
      }
    },
    [init],
  )

  /**
   * REGISTER
   */
  const register = useCallback(
    async (data: {
      name: string
      email: string
      password: string
      phone?: string
    }): Promise<AuthResult> => {
      try {
        const u = await api.auth.register(data)

        setUser(withAvatar(u))

        return {
          success: true,
        }
      } catch (err) {
        if (err instanceof ApiError) {
          return {
            success: false,
            error: err.message,
          }
        }

        return {
          success: false,
          error: 'Registration failed. Please try again.',
        }
      }
    },
    [],
  )

  /**
   * LOGOUT
   */
  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } finally {
      clearTokens()
      setUser(null)
    }
  }, [])

  /**
   * UPDATE PROFILE
   */
  const updateProfile: AuthContextType['updateProfile'] = useCallback(
    async (updated) => {
      if (!user) {
        return {
          success: false,
          error: 'Not logged in',
        }
      }

      /**
       * Avatar is stored locally because
       * backend doesn't store these fields.
       */
      if (isBrowser() && updated.avatarStyle) {
        window.localStorage.setItem(
          avatarStyleKey(user.id),
          updated.avatarStyle,
        )
      }

      if (isBrowser() && updated.avatarSeed) {
        window.localStorage.setItem(avatarSeedKey(user.id), updated.avatarSeed)
      }

      /**
       * Optimistically update UI.
       */
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
            }
          : prev,
      )

      /**
       * Send backend-supported fields.
       */
      try {
        const payload: {
          name?: string
          email?: string
          phone?: string
        } = {}

        if (updated.name !== undefined) {
          payload.name = updated.name
        }

        if (updated.email !== undefined) {
          payload.email = updated.email
        }

        if (updated.phone !== undefined) {
          payload.phone = updated.phone
        }

        if (Object.keys(payload).length > 0) {
          const saved = await api.auth.updateProfile(payload)

          setUser(withAvatar(saved))
        }

        return {
          success: true,
        }
      } catch (err) {
        if (err instanceof ApiError) {
          return {
            success: false,
            error: err.message,
          }
        }

        return {
          success: false,
          error: 'Failed to update profile',
        }
      }
    },
    [user],
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return ctx
}
