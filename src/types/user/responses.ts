import type { User, AdminUser, AuthResponse } from './entities'
import type { SuccessRes } from '../core'

export type LoginResponse = AuthResponse

export type RegisterResponse = AuthResponse

export type MeResponse = User

export type UpdateProfileResponse = User

export type ChangePasswordResponse = SuccessRes

export type ForgotPasswordResponse = SuccessRes

export type ResetPasswordResponse = SuccessRes

export type GetUsersResponse = AdminUser[]

export type CreateUserResponse = AdminUser

export type UpdateUserResponse = AdminUser

export type BanUserResponse = AdminUser

export type UnbanUserResponse = AdminUser

export interface ResetUserPasswordResponse {
  temporaryPassword?: string
  message?: string
}
