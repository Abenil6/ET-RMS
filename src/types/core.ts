// Note: Role, TicketStatus, TicketPriority, TicketCategory, and AppointmentStatus
// are now inferred from Zod schemas in their respective type domains.
// Import them from @/types/user, @/types/tickets, or @/types/appointments instead.

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'USER_DELETED'
  | 'USER_PASSWORD_RESET'
  | 'ROLE_CHANGED'
  | 'LOGIN_ATTEMPT'
  | 'LOGOUT'

export type AuditResourceType = 'USER' | 'TICKET' | 'APPOINTMENT'

export interface FileType {
  url: string
  name?: string
  size?: number
  type?: string
}

export interface ErrorRes {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export interface SuccessRes<T = any> {
  message: string
  data?: T
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
