import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher, setTokens, clearTokens } from './core'

// ============================================================
// Type Imports
// ============================================================

import type { User, AuthTokens } from '@/types/user'
import type {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types/user'

// Re-export for convenience
export type { User, AuthTokens }
export type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types/user'

// ============================================================
// Raw Execution Functions
// ============================================================

export async function login(data: LoginPayload): Promise<AuthTokens> {
  return fetcher<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function register(data: RegisterPayload): Promise<AuthTokens> {
  return fetcher<AuthTokens>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logout(): Promise<void> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
  if (!refreshToken) {
    clearTokens()
    return
  }

  try {
    await fetcher<{ loggedOut: boolean }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  } finally {
    clearTokens()
  }
}

export async function getCurrentUser(): Promise<User> {
  return fetcher<User>('/api/auth/me')
}

export async function updateProfile(data: UpdateProfilePayload): Promise<User> {
  return fetcher<User>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

async function changePassword(data: ChangePasswordPayload): Promise<{ message: string }> {
  return fetcher<{ message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function deleteAccount(): Promise<void> {
  return fetcher<void>('/api/auth/me', {
    method: 'DELETE',
  })
}

async function forgotPassword(data: ForgotPasswordPayload): Promise<{ message: string }> {
  return fetcher<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function resetPassword(data: ResetPasswordPayload): Promise<{ message: string }> {
  return fetcher<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================
// Hooks Object Definition
// ============================================================

export const authApi = {
  /**
   * Login with email and password
   * Automatically saves tokens on success
   */
  login: {
    useMutation: (options?: UseMutationOptions<AuthTokens, Error, LoginPayload>) =>
      useMutation({
        mutationFn: login,
        meta: {
          successMessage: 'Welcome back!',
          errorMessage: 'Login failed. Please check your credentials.',
        },
        ...options,
        onSuccess: (...args) => {
          setTokens(args[0].accessToken, args[0].refreshToken)
          options?.onSuccess?.(...args)
        },
      }),
  },

  /**
   * Register a new account
   * Automatically saves tokens on success
   */
  register: {
    useMutation: (options?: UseMutationOptions<AuthTokens, Error, RegisterPayload>) =>
      useMutation({
        mutationFn: register,
        meta: {
          successMessage: 'Account created! Please check your email.',
          errorMessage: 'Registration failed. Please try again.',
        },
        ...options,
        onSuccess: (...args) => {
          setTokens(args[0].accessToken, args[0].refreshToken)
          options?.onSuccess?.(...args)
        },
      }),
  },

  /**
   * Logout current user
   * Clears tokens and session
   */
  logout: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: logout,
        meta: {
          successMessage: 'Logged out successfully.',
          errorMessage: 'Logout failed.',
        },
        ...options,
      }),
  },

  /**
   * Fetch current authenticated user
   * Cached for 10 minutes
   */
  me: {
    useQuery: (options?: Omit<UseQueryOptions<User, Error, User, string[]>, 'queryKey' | 'queryFn'>) =>
      useQuery({
        queryKey: ['auth', 'me'],
        queryFn: getCurrentUser,
        meta: {
          errorMessage: 'Failed to load user session.',
        },
        staleTime: 1000 * 60 * 10,
        ...options,
      }),
  },

  /**
   * Update current user profile
   * Automatically invalidates auth/me cache
   */
  updateProfile: {
    useMutation: (options?: UseMutationOptions<User, Error, UpdateProfilePayload>) =>
      useMutation({
        mutationFn: updateProfile,
        meta: {
          successMessage: 'Profile updated.',
          errorMessage: 'Failed to update profile.',
          invalidateQueries: ['auth', 'me'],
        },
        ...options,
      }),
  },

  /**
   * Change current user password
   */
  changePassword: {
    useMutation: (options?: UseMutationOptions<{ message: string }, Error, ChangePasswordPayload>) =>
      useMutation({
        mutationFn: changePassword,
        meta: {
          successMessage: 'Password changed.',
          errorMessage: 'Failed to change password.',
        },
        ...options,
      }),
  },

  /**
   * Delete current user account permanently
   */
  deleteAccount: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: deleteAccount,
        meta: {
          successMessage: 'Account deleted.',
          errorMessage: 'Failed to delete account.',
        },
        ...options,
      }),
  },

  /**
   * Request password reset email
   */
  forgotPassword: {
    useMutation: (options?: UseMutationOptions<{ message: string }, Error, ForgotPasswordPayload>) =>
      useMutation({
        mutationFn: forgotPassword,
        meta: {
          successMessage: 'If the email exists, a reset link was sent.',
          errorMessage: 'Failed to send reset email.',
        },
        ...options,
      }),
  },

  /**
   * Reset password with token
   */
  resetPassword: {
    useMutation: (options?: UseMutationOptions<{ message: string }, Error, ResetPasswordPayload>) =>
      useMutation({
        mutationFn: resetPassword,
        meta: {
          successMessage: 'Password reset successfully.',
          errorMessage: 'Failed to reset password. Token may be expired.',
        },
        ...options,
      }),
  },
}

// ============================================================
// Default Export
// ============================================================

export default authApi
