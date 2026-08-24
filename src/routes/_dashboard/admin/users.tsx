import { createFileRoute } from '@tanstack/react-router'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'

export const Route = createFileRoute('/_dashboard/admin/users')({
  component: AdminUsersPage,
})
