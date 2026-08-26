import type { Role } from './schemas'

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

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  phone?: string
  role: Role
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  role?: Role
  isBanned?: boolean
}

export interface BanUserPayload {
  banned: boolean
  reason?: string
}
