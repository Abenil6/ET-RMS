import { create } from 'zustand'
import {
  loginFn,
  logoutFn,
  meFn,
  registerFn,
  updateProfileFn,
} from '@/apis/auth'
import type { RegisterPayload, UpdateProfilePayload, User as ApiUser } from '@/apis/auth'
import { clearTokens, getAccessToken, setTokens } from '@/apis/core'

export type AuthUser = ApiUser & {
  avatarStyle: string
  avatarSeed: string
}

export type AuthResult =
  | { success: true }
  | { success: false; error: string }

export type UpdateProfileInput = UpdateProfilePayload & {
  avatarStyle?: string
  avatarSeed?: string
}

export type AuthStore = {
  user: AuthUser | null
  loading: boolean
  isLoggedIn: boolean
  initialized: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResult>
  register: (data: RegisterPayload) => Promise<AuthResult>
  logout: () => Promise<void>
  updateProfile: (updated: UpdateProfileInput) => Promise<AuthResult>
}

let initializePromise: Promise<void> | null = null

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

function withAvatar(user: ApiUser): AuthUser {
  return {
    ...user,
    avatarStyle: getAvatarStyle(user.id),
    avatarSeed: getAvatarSeed(user.id),
  }
}

function persistAvatar(userId: string, updated: UpdateProfileInput) {
  if (!isBrowser()) return

  if (updated.avatarStyle) {
    window.localStorage.setItem(avatarStyleKey(userId), updated.avatarStyle)
  }

  if (updated.avatarSeed) {
    window.localStorage.setItem(avatarSeedKey(userId), updated.avatarSeed)
  }
}

function toApiProfilePayload(updated: UpdateProfileInput): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {}

  if (updated.name !== undefined) payload.name = updated.name
  if (updated.email !== undefined) payload.email = updated.email
  if (updated.phone !== undefined) payload.phone = updated.phone

  return payload
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  isLoggedIn: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return
    if (initializePromise) return initializePromise

    initializePromise = (async () => {
      const token = getAccessToken()

      if (!token) {
        set({
          user: null,
          loading: false,
          isLoggedIn: false,
          initialized: true,
        })
        return
      }

      set({ loading: true })

      try {
        const user = await meFn()
        set({
          user: withAvatar(user),
          loading: false,
          isLoggedIn: true,
          initialized: true,
        })
      } catch {
        clearTokens()
        set({
          user: null,
          loading: false,
          isLoggedIn: false,
          initialized: true,
        })
      }
    })()

    try {
      await initializePromise
    } finally {
      initializePromise = null
    }
  },

  login: async (email: string, password: string) => {
    try {
      const data = await loginFn({ email: email.trim(), password })
      setTokens(data.accessToken, data.refreshToken)
      set({
        user: withAvatar(data.user),
        loading: false,
        isLoggedIn: true,
        initialized: true,
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Login failed. Please try again.'),
      }
    }
  },

  register: async (data: RegisterPayload) => {
    try {
      const response = await registerFn(data)
      setTokens(response.accessToken, response.refreshToken)
      set({
        user: withAvatar(response.user),
        loading: false,
        isLoggedIn: true,
        initialized: true,
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Registration failed. Please try again.'),
      }
    }
  },

  logout: async () => {
    try {
      await logoutFn()
    } finally {
      clearTokens()
      set({
        user: null,
        loading: false,
        isLoggedIn: false,
        initialized: true,
      })
    }
  },

  updateProfile: async (updated: UpdateProfileInput) => {
    const currentUser = get().user

    if (!currentUser) {
      return { success: false, error: 'Not logged in' }
    }

    persistAvatar(currentUser.id, updated)

    const optimisticUser = {
      ...currentUser,
      ...updated,
    }

    set({ user: optimisticUser })

    try {
      const payload = toApiProfilePayload(updated)

      if (Object.keys(payload).length === 0) {
        return { success: true }
      }

      const savedUser = await updateProfileFn(payload)

      set({
        user: {
          ...withAvatar(savedUser),
          avatarStyle: optimisticUser.avatarStyle,
          avatarSeed: optimisticUser.avatarSeed,
        },
      })

      return { success: true }
    } catch (error) {
      set({ user: currentUser })

      return {
        success: false,
        error: getErrorMessage(error, 'Failed to update profile'),
      }
    }
  },
}))
