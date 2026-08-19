import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/apis/auth'
import { clearTokens, getAccessToken } from '@/apis/core'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
  createdAt: string
  avatarStyle: string
  avatarSeed: string
}

type AuthResult =
  | { success: true }
  | { success: false; error: string }

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

function isBrowser() {
  return typeof window !== 'undefined'
}

function avatarStyleKey(userId: string) {
  return `avatar_style:${userId}`
}

function avatarSeedKey(userId: string) {
  return `avatar_seed:${userId}`
}

function getAvatarStyle(userId: string): string {
  if (!isBrowser()) return 'bottts'
  return window.localStorage.getItem(avatarStyleKey(userId)) || 'bottts'
}

function getAvatarSeed(userId: string): string {
  if (!isBrowser()) return userId
  return window.localStorage.getItem(avatarSeedKey(userId)) || userId
}

function withAvatar(u: Omit<User, 'avatarStyle' | 'avatarSeed'>): User {
  return {
    ...u,
    avatarStyle: getAvatarStyle(u.id),
    avatarSeed: getAvatarSeed(u.id),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  /**
   * Initialize authentication using authApi.me query.
   * This replaces the manual useEffect + api.auth.me() call.
   */
  const { data: meData, isLoading: meLoading, error: meError } =
    authApi.me.useQuery({
      enabled: !!getAccessToken(),
      retry: false,
    })

  useEffect(() => {
    if (meData) {
      setUser(withAvatar(meData))
    } else if (meError) {
      clearTokens()
      setUser(null)
    }
    setLoading(false)
  }, [meData, meError])

  /**
   * LOGIN
   * Uses authApi.login.useMutation() - global error handling via meta
   */
  const loginMutation = authApi.login.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        await loginMutation.mutateAsync({ email: email.trim(), password })
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Login failed. Please try again.',
        }
      }
    },
    [loginMutation],
  )

  /**
   * REGISTER
   */
  const registerMutation = authApi.register.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  const register = useCallback(
    async (data: {
      name: string
      email: string
      password: string
      phone?: string
    }): Promise<AuthResult> => {
      try {
        await registerMutation.mutateAsync(data)
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Registration failed. Please try again.',
        }
      }
    },
    [registerMutation],
  )

  /**
   * LOGOUT
   */
  const logoutMutation = authApi.logout.useMutation()

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      clearTokens()
      queryClient.setQueryData(['auth', 'me'], null)
      setUser(null)
    }
  }, [logoutMutation, queryClient])

  /**
   * UPDATE PROFILE
   */
  const updateProfileMutation = authApi.updateProfile.useMutation()

  const updateProfile: AuthContextType['updateProfile'] = useCallback(
    async (updated) => {
      if (!user) {
        return { success: false, error: 'Not logged in' }
      }

      // Optimistically update avatar locally (stored in localStorage)
      if (isBrowser() && updated.avatarStyle) {
        window.localStorage.setItem(avatarStyleKey(user.id), updated.avatarStyle)
      }
      if (isBrowser() && updated.avatarSeed) {
        window.localStorage.setItem(avatarSeedKey(user.id), updated.avatarSeed)
      }

      // Optimistically update UI
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
            }
          : prev,
      )

      // Send backend-supported fields
      try {
        const payload: { name?: string; email?: string; phone?: string } = {}
        if (updated.name !== undefined) payload.name = updated.name
        if (updated.email !== undefined) payload.email = updated.email
        if (updated.phone !== undefined) payload.phone = updated.phone

        if (Object.keys(payload).length > 0) {
          await updateProfileMutation.mutateAsync(payload)
        }

        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update profile',
        }
      }
    },
    [user, updateProfileMutation],
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading: loading || meLoading,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, meLoading, login, register, logout, updateProfile],
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
