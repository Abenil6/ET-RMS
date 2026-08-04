import type { QueueInfo } from '../lib/useQueuePosition'

type QueueFields = Pick<QueueInfo, 'position' | 'ahead' | 'estimatedWaitMinutes'>

type QueueInfoCardsProps = {
  queue: QueueFields
  updatedAt: Date | null
  error: string | null
  onRefresh: () => void
}

export function QueueInfoCards({ queue, updatedAt, error, onRefresh }: QueueInfoCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-text-secondary">Position in Queue</p>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs text-primary-green font-semibold hover:underline"
          >
            Refresh
          </button>
        </div>
        <p className="text-3xl font-extrabold text-primary-blue">{queue.position}</p>
        <p className="text-xs text-text-secondary mt-1">{queue.ahead} ahead</p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card">
        <p className="text-sm text-text-secondary mb-1">Est. Wait</p>
        <p className="text-3xl font-extrabold text-primary-green">
          {queue.estimatedWaitMinutes}m
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {updatedAt
            ? `Live · updated ${updatedAt.toLocaleTimeString()}`
            : error
              ? 'Showing snapshot'
              : 'Live'}
        </p>
      </div>
    </div>
  )
}
