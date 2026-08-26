import type { AuditAction, AuditResourceType, PaginatedResponse } from '../core'

export interface AuditPerformedBy {
  id: string
  email: string
  name: string
}

export interface AuditLog {
  id: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId: string
  description: string
  changes: string | null
  performedBy: string
  performedByUser: AuditPerformedBy
  ipAddress: string | null
  userAgent: string | null
  status: string
  errorMessage: string | null
  createdAt: string
}

export interface QueueStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  averageWaitTime: number
}

export interface AdminQueueItem {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  customer: {
    name: string
    email: string
  }
  position: number
  estimatedWaitMinutes: number
}

export interface AdminQueueResponse {
  total: number
  queue: AdminQueueItem[]
}
