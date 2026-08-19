import { CalendarRange } from 'lucide-react'
import { PRESET_OPTIONS, formatRange } from '@/hooks/useDateRange'
import type { RangePreset } from '@/hooks/useDateRange'
import type { DateRange } from '@/lib/dashboardStats'

type Props = {
  preset: RangePreset
  onPresetChange: (p: RangePreset) => void
  custom: DateRange
  onCustomChange: (r: DateRange) => void
  range: DateRange
}

function toInputValue(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function DateRangePicker({
  preset,
  onPresetChange,
  custom,
  onCustomChange,
  range,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
        <CalendarRange size={16} className="text-text-secondary" />
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as RangePreset)}
          className="bg-transparent text-sm font-medium text-text-dark focus:outline-none cursor-pointer"
        >
          {PRESET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-text-secondary whitespace-nowrap">
          {formatRange(range)}
        </span>
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
          <input
            type="date"
            value={custom?.from ? toInputValue(custom.from) : ''}
            onChange={(e) => {
              if (!e.target.value) return
              const from = new Date(`${e.target.value}T00:00:00`)
              const to = custom?.to ? new Date(custom.to) : new Date()
              to.setHours(23, 59, 59, 999)
              onCustomChange({ from, to })
            }}
            className="bg-transparent text-sm text-text-dark focus:outline-none"
          />
          <span className="text-text-secondary">–</span>
          <input
            type="date"
            value={custom?.to ? toInputValue(custom.to) : ''}
            onChange={(e) => {
              if (!e.target.value) return
              const to = new Date(`${e.target.value}T23:59:59.999`)
              const from = custom?.from
                ? new Date(custom.from)
                : new Date(to.getTime() - 29 * 86_400_000)
              onCustomChange({ from, to })
            }}
            className="bg-transparent text-sm text-text-dark focus:outline-none"
          />
        </div>
      )}
    </div>
  )
}
