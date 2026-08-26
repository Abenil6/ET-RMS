import type { AppointmentStatus } from '../core'

export interface CreateAppointmentPayload {
  branch: string
  slotTime: string
  notes?: string
}

export interface UpdateAppointmentPayload {
  status: AppointmentStatus
}
