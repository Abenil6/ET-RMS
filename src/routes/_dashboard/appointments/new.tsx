import { createFileRoute } from '@tanstack/react-router'
import { NewAppointmentPage } from '@/features/appointments/pages/NewAppointmentPage'

export const Route = createFileRoute('/_dashboard/appointments/new')({
  component: NewAppointmentPage,
})
