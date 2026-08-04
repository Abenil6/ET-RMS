// src/data/tickets.ts
import type { TicketPriority, TicketStatus } from '../lib/types'

// Status display config for REAL API tickets
export const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; bg: string }
> = {
  OPEN: { label: 'Open', color: 'text-blue-700', bg: 'bg-blue-100' },
  ASSIGNED: { label: 'Assigned', color: 'text-purple-700', bg: 'bg-purple-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  RESOLVED: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-100' },
  CLOSED: { label: 'Closed', color: 'text-gray-700', bg: 'bg-gray-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
}

export const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: string; bg: string }
> = {
  LOW: { label: 'Low', color: 'text-gray-700', bg: 'bg-gray-100' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' },
  URGENT: { label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100' },
}

export const CATEGORY_LABELS: Record<string, string> = {
  CONNECTIVITY: 'Connectivity',
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  BILLING: 'Billing',
  OTHER: 'Other',
}