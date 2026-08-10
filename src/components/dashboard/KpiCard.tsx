import { motion } from 'motion/react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Color = 'primary-green' | 'warning' | 'success' | 'primary-blue'

const COLOR_MAP: Record<Color, { bg: string; text: string }> = {
  'primary-green': { bg: 'bg-primary-green/10', text: 'text-primary-green' },
  'primary-blue': { bg: 'bg-primary-blue/10', text: 'text-primary-blue' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  success: { bg: 'bg-success/10', text: 'text-success' },
}

type Props = {
  icon: LucideIcon
  label: string
  value: number
  delta?: number | null
  unit?: string
  color?: Color
  delay?: number
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  unit,
  color = 'primary-green',
  delay = 0,
}: Props) {
  const { bg, text } = COLOR_MAP[color]

  const deltaContent =
    delta === null || delta === undefined ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
        <Minus size={13} /> n/a
      </span>
    ) : delta >= 0 ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
        <TrendingUp size={13} /> {delta}%
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-error">
        <TrendingDown size={13} /> {delta}%
      </span>
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${text}`} />
        </div>
        {deltaContent}
      </div>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-text-dark mt-1">
        {value.toLocaleString()}
        {unit ? <span className="text-base font-semibold text-text-secondary ml-1">{unit}</span> : null}
      </p>
    </motion.div>
  )
}
