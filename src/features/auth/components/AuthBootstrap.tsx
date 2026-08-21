import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { AuthUser } from '@/features/auth/store/authStore'

function toApiUser(user: AuthUser) {
  const { avatarStyle: _avatarStyle, avatarSeed: _avatarSeed, ...apiUser } = user
  return apiUser
}

export function AuthBootstrap({ children }: { children: ReactNode }) {
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
