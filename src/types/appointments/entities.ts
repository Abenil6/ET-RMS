import type { AppointmentStatus } from './schemas'

export interface AppointmentUser {
  id: string
  name: string
  email: string
}

export interface Appointment {
  id: string
  branch: string
  slotTime: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
  userId: string
  user: AppointmentUser
}
