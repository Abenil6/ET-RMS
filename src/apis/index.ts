

import authApi from './auth'
import ticketsApi from './tickets'
import appointmentsApi from './appointments'
import notificationsApi from './notifications'
import adminApi from './admin'

// ============================================================
// Core Exports (apiClient, utilities)
// ============================================================

export { queryClient } from './queryClient'
export { apiClient } from './apiClient'
export { request, ApiError, getAccessToken, setTokens, clearTokens } from './core'

// ============================================================
// Named Resource Exports (for tree-shaking)
// ============================================================

export { authApi as Auth } from './auth'
export { ticketsApi as Tickets } from './tickets'
export { appointmentsApi as Appointments } from './appointments'
export { notificationsApi as Notifications } from './notifications'
export { adminApi as Admin } from './admin'

// ============================================================
// Type Re-exports
// ============================================================

// Auth types
export type {
  User,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth'

// Tickets types
export type {
  Ticket,
  Technician,
  QueueInfo,
  TechnicianType,
  QueueInfoType,
  CreateTicketInput,
  UpdateTicketInput,
  AssignTicketInput,
  ResolveTicketInput,
  ReviewTicketInput,
} from './tickets'

// Appointments types
export type {
  Appointment,
  AppointmentType,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFormInput,
} from './appointments'

// Notifications types
export type {
  Notification,
  NotificationType,
} from './notifications'

// Admin types
export type {
  AdminUser,
  AdminUserType,
  CreateUserPayload,
  UpdateUserPayload,
  AuditLog,
  AuditLogType,
  AuditLogPagination,
  AuditLogsResponse,
  QueueStats,
  QueueStatsType,
  AdminQueueItem,
  AdminQueueResponse,
  InviteUserInput,
  UpdateUserInput,
  BanUserInput,
  AuditLogFilters,
} from './admin'


export const api = {
  Auth: authApi,
  Tickets: ticketsApi,
  Appointments: appointmentsApi,
  Notifications: notificationsApi,
  Admin: adminApi,
}

export default api
