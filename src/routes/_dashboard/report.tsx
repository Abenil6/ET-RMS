import { createFileRoute } from '@tanstack/react-router'
import { ReportPage } from '@/features/dashboard/pages/ReportPage'

export const Route = createFileRoute('/_dashboard/report')({
  component: ReportPage,
})
