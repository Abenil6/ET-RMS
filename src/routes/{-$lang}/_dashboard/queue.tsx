import { createFileRoute } from '@tanstack/react-router'
import { QueuePage } from '@/features/queue/pages/QueuePage'

export const Route = createFileRoute('/{-$lang}/_dashboard/queue')({
  component: QueuePage,
})
