import { createFileRoute } from '@tanstack/react-router'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'

export const Route = createFileRoute('/{-$lang}/_dashboard/admin/users')({
  component: AdminUsersPage,
})
