import type { Notification } from './entities'

export type GetNotificationsResponse = Notification[]

export type GetUnreadCountResponse = number

export type MarkAsReadResponse = void

export type MarkAllAsReadResponse = void
