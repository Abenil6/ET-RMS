import { createFileRoute } from '@tanstack/react-router'
import { NewAppointmentPage } from '@/features/appointments/pages/NewAppointmentPage'

export const Route = createFileRoute('/{-$lang}/_dashboard/appointments/new')({
  component: NewAppointmentPage,
})
