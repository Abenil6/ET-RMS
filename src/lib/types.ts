export type Role = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TicketCategory = 'CONNECTIVITY' | 'HARDWARE' | 'SOFTWARE' | 'BILLING' | 'OTHER'

export type AppointmentStatus = 'RESERVED' | 'COMPLETED' | 'CANCELLED'

export interface User {
    id: string
    name: string
    email: string
    phone: string | null
    role: Role
    createdAt: string
}

export interface Ticket {
    id: string
    ticketNumber: string
    subject: string
    serviceNumber: string
    category: TicketCategory
    description: string
    status: TicketStatus
    priority: TicketPriority
    createdAt: string
    updatedAt: string
    resolvedAt: string | null
    customerId: string
    technicianId: string | null
    customer: {
        id: string
        name: string
        email: string
    }
    technician: {
        id: string
        name: string
        email: string
    } | null
    review: {
        rating: number
        comment: string
        createdAt: string
    } | null
    queue?: {
        position: number
        ahead: number
        estimatedWaitMinutes: number
    }
}

export interface Appointment {
    id: string
    branch: string
    slotTime: string
    status: AppointmentStatus
    notes: string | null
    createdAt: string
    userId: string
    user: {
        id: string
        name: string
        email: string
    }
}

export interface Notification {
    id: string
    message: string
    read: boolean
    createdAt: string
    userId: string
    ticketId: string | null
}

export interface AdminUser {
    id: string
    name: string
    email: string
    phone: string | null
    role: Role
    banned: boolean
    bannedAt: string | null
    createdAt: string
}

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

export interface AuditLog {
    id: string
    action: AuditAction
    resourceType: AuditResourceType
    resourceId: string
    description: string
    changes: string | null
    performedBy: string
    performedByUser: {
        id: string
        email: string
        name: string
    }
    ipAddress: string | null
    userAgent: string | null
    status: string
    errorMessage: string | null
    createdAt: string
}

export interface AuditLogPagination {
    page: number
    limit: number
    total: number
    totalPages: number
}