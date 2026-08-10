import { Download } from 'lucide-react'

type Props = {
  filename: string
  headers: string[]
  rows: (string | number)[][]
}

function escapeCell(value: string | number) {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function CsvExportButton({ filename, headers, rows }: Props) {
  function handleExport() {
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-semibold hover:bg-bg transition"
      type="button"
    >
      <Download size={16} />
      Export
    </button>
  )
}
