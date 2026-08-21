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
