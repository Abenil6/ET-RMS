import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/authStore'
import type {
  AuthResult,
  AuthStore,
  AuthUser as User,
  UpdateProfileInput,
} from '@/features/auth/store/authStore'

export type { AuthResult, User }

export type AuthContextType = {
  user: User | null
  loading: boolean
  isLoggedIn: boolean
  login: AuthStore['login']
  register: AuthStore['register']
  logout: AuthStore['logout']
  updateProfile: (updated: UpdateProfileInput) => Promise<AuthResult>
}

function toApiUser(user: User) {
  const { avatarStyle: _avatarStyle, avatarSeed: _avatarSeed, ...apiUser } = user
  return apiUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const initialize = useAuthStore((state) => state.initialize)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    queryClient.setQueryData(['auth', 'me'], user ? toApiUser(user) : null)
  }, [queryClient, user])

  return <>{children}</>
}

export function useAuth(): AuthContextType {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const updateProfile = useAuthStore((state) => state.updateProfile)

  return {
    user,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile,
  }
}
