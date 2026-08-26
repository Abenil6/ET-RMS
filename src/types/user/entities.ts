import type { Role } from '../core'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  createdAt: string
}

export interface AdminUser extends User {
  banned: boolean
  bannedAt: string | null
  lastLoginAt: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
