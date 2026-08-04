import { motion } from 'motion/react'
import type { ComponentType } from 'react'

export type AccentColor = 'primary-green' | 'primary-blue' | 'warning'

type FeatureCardProps = {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  accent: AccentColor
}

const ACCENT_CLASS: Record<AccentColor, string> = {
  'primary-green': 'bg-primary-green/10 text-primary-green',
  'primary-blue': 'bg-primary-blue/10 text-primary-blue',
  warning: 'bg-warning/10 text-warning',
}

export function FeatureCard({ icon: Icon, title, description, accent }: FeatureCardProps) {
  return (
    <motion.div
      className="group rounded-[1.75rem] border border-border bg-card p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className={`inline-flex rounded-2xl p-3 ${ACCENT_CLASS[accent]}`}>
        <Icon size={22} />
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-text-dark">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
    </motion.div>
  )
}
