export { queryClient } from './queryClient'
export { fetcher, ApiError, getAccessToken, setTokens, clearTokens } from './core'

export { authApi as Auth } from './auth'
export { ticketsApi as Tickets } from './tickets'
export { appointmentsApi as Appointments } from './appointments'
export { notificationsApi as Notifications } from './notifications'
export { adminApi as Admin } from './admin'

export type {
  User,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from './auth'

export type {
  TicketFormType,
  TicketUpdateType,
  QueueInfoType,
} from './tickets'

export type {
  AppointmentType,
  AppointmentFormType,
  AppointmentUpdateType,
} from './appointments'

export type {
  NotificationType,
} from './notifications'

export type {
  AdminUserType,
  CreateUserPayload,
  UpdateUserPayload,
  AuditLogType,
  QueueStatsType,
  AdminQueueItem,
  AdminQueueResponse,
} from './admin'


import { authApi } from './auth'
import { ticketsApi } from './tickets'
import { appointmentsApi } from './appointments'
import { notificationsApi } from './notifications'
import { adminApi } from './admin'

export const api = {
  Auth: authApi,
  Tickets: ticketsApi,
  Appointments: appointmentsApi,
  Notifications: notificationsApi,
  Admin: adminApi,
}

export default api
