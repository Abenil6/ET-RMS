type InfoFieldProps = {
  label: string
  value: string
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-text-secondary tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm text-text-dark font-medium">{value}</p>
    </div>
  )
}
