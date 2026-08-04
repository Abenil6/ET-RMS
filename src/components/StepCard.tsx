type StepCardProps = {
  number: string
  title: string
  description: string
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg p-5">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-green">
        {number}
      </p>
      <h3 className="mt-3 text-lg font-extrabold text-text-dark">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  )
}
