import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { fetcher, setTokens, clearTokens } from './core'

// types

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  phone?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

// raw api functions (what the hooks use under the hood)

export async function loginFn(data: LoginPayload): Promise<AuthTokens> {
  return fetcher<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function registerFn(data: RegisterPayload): Promise<AuthTokens> {
  return fetcher<AuthTokens>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logoutFn(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token')
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

export async function meFn(): Promise<User> {
  return fetcher<User>('/api/auth/me')
}

export async function updateProfileFn(data: UpdateProfilePayload): Promise<User> {
  return fetcher<User>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

async function changePasswordFn(data: ChangePasswordPayload): Promise<{ message: string }> {
  return fetcher<{ message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function deleteAccountFn(): Promise<void> {
  return fetcher<void>('/api/auth/me', {
    method: 'DELETE',
  })
}

async function forgotPasswordFn(data: ForgotPasswordPayload): Promise<{ message: string }> {
  return fetcher<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

async function resetPasswordFn(data: ResetPasswordPayload): Promise<{ message: string }> {
  return fetcher<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// hooks that components can use to interact with the auth API
export const authApi = {
login: {
  useMutation: (options?: UseMutationOptions<AuthTokens, Error, LoginPayload>) =>
    useMutation({
      mutationFn: loginFn,
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

  register: {
  useMutation: (options?: UseMutationOptions<AuthTokens, Error, RegisterPayload>) =>
    useMutation({
      mutationFn: registerFn,
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

  logout: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: logoutFn,
        meta: {
          successMessage: 'Logged out successfully.',
          errorMessage: 'Logout failed.',
        },
        ...options,
      }),
  },

  me: {
    useQuery: (options?: Omit<UseQueryOptions<User, Error, User, string[]>, 'queryKey' | 'queryFn'>) =>
      useQuery({
        queryKey: ['auth', 'me'],
        queryFn: meFn,
        meta: {
          errorMessage: 'Failed to load user session.',
        },
        staleTime: 1000 * 60 * 10, // 10 min
        ...options,
      }),
  },

  updateProfile: {
    useMutation: (options?: UseMutationOptions<User, Error, UpdateProfilePayload>) =>
      useMutation({
        mutationFn: updateProfileFn,
        meta: {
          successMessage: 'Profile updated.',
          errorMessage: 'Failed to update profile.',
          invalidateQueries: ['auth', 'me'],
        },
        ...options,
      }),
  },

  changePassword: {
    useMutation: (options?: UseMutationOptions<{ message: string }, Error, ChangePasswordPayload>) =>
      useMutation({
        mutationFn: changePasswordFn,
        meta: {
          successMessage: 'Password changed.',
          errorMessage: 'Failed to change password.',
        },
        ...options,
      }),
  },

  deleteAccount: {
    useMutation: (options?: UseMutationOptions<void, Error, void>) =>
      useMutation({
        mutationFn: deleteAccountFn,
        meta: {
          successMessage: 'Account deleted.',
          errorMessage: 'Failed to delete account.',
        },
        ...options,
      }),
  },

  forgotPassword: {
    useMutation: (options?: UseMutationOptions<{ message: string }, Error, ForgotPasswordPayload>) =>
      useMutation({
        mutationFn: forgotPasswordFn,
        meta: {
          successMessage: 'If the email exists, a reset link was sent.',
          errorMessage: 'Failed to send reset email.',
        },
        ...options,
      }),
  },

  resetPassword: {
    useMutation: (options?: UseMutationOptions<{ message: string }, Error, ResetPasswordPayload>) =>
      useMutation({
        mutationFn: resetPasswordFn,
        meta: {
          successMessage: 'Password reset successfully.',
          errorMessage: 'Failed to reset password. Token may be expired.',
        },
        ...options,
      }),
  },
}
