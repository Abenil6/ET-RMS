import type { AuditAction, AuditResourceType } from '../core'

export interface GetAuditLogsParams {
  action?: AuditAction
  resourceType?: AuditResourceType
  performedBy?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
