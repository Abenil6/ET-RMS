import { createFileRoute } from '@tanstack/react-router'
import { TechniciansPage } from '@/features/technicians/pages/TechniciansPage'

export const Route = createFileRoute('/_dashboard/technicians')({
  component: TechniciansPage,
})
