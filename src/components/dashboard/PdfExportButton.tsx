import { FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import etlogo from '../../assets/Et-logo.png'

type Props = {
  filename: string
  title?: string
  headers: string[]
  rows: (string | number)[][]
}

export function PdfExportButton({ filename, title, headers, rows }: Props) {
  async function handleExport() {
    const doc = new jsPDF()

    const logoDataUrl = await fetch(etlogo)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          }),
      )
      .catch(() => '')

    doc.setFillColor(0, 114, 206)
    doc.rect(0, 0, 210, 34, 'F')

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'JPEG', 12, 7, 30, 18)
    }
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.text('NetCare Ticket Report', 46, 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(title ?? 'Tickets Report', 46, 24)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 46, 30)

    autoTable(doc, {
      head: [headers],
      body: rows.map((row) => row.map(String)),
      startY: 42,
      tableWidth: 'auto', // Use full available width
      styles: {
        fontSize: 9, // Increased from 8 for better readability
        cellPadding: 4, // Increased from 2.5 for more breathing room
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        textColor: [51, 65, 85],
        overflow: 'linebreak', // Wrap long text instead of truncating
        minCellHeight: 8, // Minimum row height for less cramped appearance
      },
      headStyles: {
        fillColor: [0, 114, 206],
        textColor: 255,
        fontStyle: 'bold',
        cellPadding: 5, // Extra padding in header
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 8, right: 8, bottom: 12 }, // Reduced side margins for wider table
    })

    doc.save(filename)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-semibold hover:bg-bg transition"
      type="button"
    >
      <FileDown size={16} />
      Export PDF
    </button>
  )
}
