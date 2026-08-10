import type { ReactNode } from 'react'
import { motion } from 'motion/react'

type Props = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  delay = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-dark">{title}</h3>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}
