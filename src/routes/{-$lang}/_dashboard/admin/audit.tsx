import { createFileRoute } from '@tanstack/react-router'
import { AdminAuditPage } from '@/features/admin/pages/AdminAuditPage'

export const Route = createFileRoute('/{-$lang}/_dashboard/admin/audit')({
  component: AdminAuditPage,
})
