import type { QueueInfo } from '@/hooks/useQueuePosition'
import { useTranslation } from 'react-i18next'

type QueueFields = Pick<
  QueueInfo,
  'position' | 'ahead' | 'estimatedWaitMinutes'
>

type QueueInfoCardsProps = {
  queue: QueueFields
  updatedAt: Date | null
  error: string | null
  onRefresh: () => void
}

export function QueueInfoCards({
  queue,
  updatedAt,
  error,
  onRefresh,
}: QueueInfoCardsProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-text-secondary">
            {t('queue_info.position')}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs text-primary-green font-semibold hover:underline"
          >
            {t('common.refresh')}
          </button>
        </div>
        <p className="text-3xl font-extrabold text-primary-blue">
          {queue.position}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {t('queue_info.ahead', { count: queue.ahead })}
        </p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card">
        <p className="text-sm text-text-secondary mb-1">
          {t('queue_info.estimated_wait')}
        </p>
        <p className="text-3xl font-extrabold text-primary-green">
          {t('queue_info.minutes_short', { count: queue.estimatedWaitMinutes })}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {updatedAt
            ? t('queue_info.updated', { time: updatedAt.toLocaleTimeString() })
            : error
              ? t('queue_info.snapshot')
              : t('queue_info.live')}
        </p>
      </div>
    </div>
  )
}
