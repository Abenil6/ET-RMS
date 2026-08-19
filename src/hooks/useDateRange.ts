import { useMemo, useState } from 'react'
import type { DateRange } from '@/lib/dashboardStats'

export type RangePreset =
  | 'today'
  | '7d'
  | '30d'
  | '3m'
  | 'all'
  | 'custom'

export const PRESET_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
]

export function rangeForPreset(
  preset: RangePreset,
  custom: DateRange,
): DateRange {
  if (preset === 'all') return null
  if (preset === 'custom') return custom

  const to = new Date()
  to.setHours(23, 59, 59, 999)
  const from = new Date(to)

  if (preset === 'today') {
    from.setHours(0, 0, 0, 0)
  } else if (preset === '7d') {
    from.setDate(to.getDate() - 6)
    from.setHours(0, 0, 0, 0)
  } else if (preset === '30d') {
    from.setDate(to.getDate() - 29)
    from.setHours(0, 0, 0, 0)
  } else {
    from.setMonth(to.getMonth() - 2)
    from.setHours(0, 0, 0, 0)
  }

  return { from, to }
}

export function formatRange(range: DateRange): string {
  if (!range) return 'All time'
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

export function useDateRange() {
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [custom, setCustom] = useState<DateRange>(null)

  const range = useMemo(
    () => rangeForPreset(preset, custom),
    [preset, custom],
  )

  return { preset, setPreset, custom, setCustom, range }
}
