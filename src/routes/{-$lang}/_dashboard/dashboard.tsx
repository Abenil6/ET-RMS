import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export const Route = createFileRoute('/{-$lang}/_dashboard/dashboard')({
  component: DashboardPage,
})
