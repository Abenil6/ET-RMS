import { createFileRoute } from '@tanstack/react-router'
import { TicketsPage } from '@/features/tickets/pages/TicketsPage'

export const Route = createFileRoute('/_dashboard/tickets/')({
  component: TicketsPage,
})
