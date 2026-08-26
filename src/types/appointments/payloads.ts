import type { AppointmentStatus } from './schemas'

export interface CreateAppointmentPayload {
  branch: string
  slotTime: string
  notes?: string
}

export interface UpdateAppointmentPayload {
  status: AppointmentStatus
}
