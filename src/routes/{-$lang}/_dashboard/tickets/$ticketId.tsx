import { createFileRoute } from '@tanstack/react-router'
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage'

export const Route = createFileRoute('/{-$lang}/_dashboard/tickets/$ticketId')({
  component: TicketDetailPage,
})
