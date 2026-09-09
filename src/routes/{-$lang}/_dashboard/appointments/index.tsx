import { createFileRoute } from '@tanstack/react-router'
import { AppointmentsPage } from '@/features/appointments/pages/AppointmentsPage'

export const Route = createFileRoute('/{-$lang}/_dashboard/appointments/')({
  component: AppointmentsPage,
})
