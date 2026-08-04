import type { ComponentType } from 'react'

type TrustPillProps = {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
}

export function TrustPill({ icon: Icon, title, description }: TrustPillProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-bg p-5">
      <div className="rounded-2xl bg-primary-green/10 p-3 text-primary-green">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-text-dark">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
    </div>
  )
}
