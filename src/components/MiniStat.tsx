import { motion } from 'motion/react'
import type { ComponentType } from 'react'

type MiniStatProps = {
  value: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

export function MiniStat({ value, label, icon: Icon }: MiniStatProps) {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary-green/10 p-2 text-primary-green">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-text-dark">{value}</p>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}
