import type { AuditLog, QueueStats, AdminQueueResponse } from './entities'
import type { PaginatedResponse } from '../core'

export type GetAuditLogsResponse = PaginatedResponse<AuditLog>

export type GetQueueStatsResponse = QueueStats

export type GetAdminQueueResponse = AdminQueueResponse
