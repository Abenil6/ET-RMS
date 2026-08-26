import { createFileRoute } from '@tanstack/react-router'
import { QueuePage } from '@/features/queue/pages/QueuePage'

export const Route = createFileRoute('/_dashboard/queue')({
  component: QueuePage,
})
