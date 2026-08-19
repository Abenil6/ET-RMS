import { FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import etlogo from '@/assets/Et-logo.png'

type Props = {
  filename: string
  title?: string
  headers: string[]
  rows: (string | number)[][]
}

export function PdfExportButton({ filename, title, headers, rows }: Props) {
  async function handleExport() {
    // Use landscape orientation for better column width
    const doc = new jsPDF('landscape', 'mm', 'a4')

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

    // Professional header with green background (Ethio Telecom brand color)
    doc.setFillColor(43, 182, 115) // #2BB673 - primary-green
    doc.rect(0, 0, 297, 32, 'F')

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 10, 6, 28, 18)
    }
    
    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('NetCare Ticket Report', 42, 14)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(title ?? 'Administrative Report', 42, 21)
    
    doc.setFontSize(8)
    const dateStr = new Date().toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.text(`Generated: ${dateStr}`, 42, 27)
    
    // Add total count on the right side
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${rows.length} Records`, 265, 19, { align: 'right' })

    // Optimized column widths - Total: 277mm available width
    // Calculated to fit perfectly within page: 8 (left margin) + 277 (table) + 8 (right margin) = 293mm
    const columnStyles = {
      0: { cellWidth: 23, halign: 'left' as const },      // Ticket # (e.g., TKT-2024-001)
      1: { cellWidth: 55, halign: 'left' as const },      // Subject (longest text)
      2: { cellWidth: 22, halign: 'center' as const },    // Status (OPEN, RESOLVED, etc.)
      3: { cellWidth: 20, halign: 'center' as const },    // Priority (URGENT, HIGH, etc.)
      4: { cellWidth: 27, halign: 'left' as const },      // Category (CONNECTIVITY, etc.)
      5: { cellWidth: 36, halign: 'left' as const },      // Customer name
      6: { cellWidth: 36, halign: 'left' as const },      // Technician name
      7: { cellWidth: 31, halign: 'left' as const },      // Created date/time
      8: { cellWidth: 31, halign: 'left' as const },      // Resolved date/time
      9: { cellWidth: 16, halign: 'center' as const },    // Rating (1-5 or empty)
    }

    autoTable(doc, {
      head: [headers],
      body: rows.map((row) => row.map(String)),
      startY: 38, // Start closer to header - reduced from 46
      theme: 'striped',
      
      // Column configuration
      columnStyles,
      
      // Table styling - optimized for space efficiency
      styles: {
        fontSize: 8.5, // Slightly smaller but still readable
        cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 }, // Compact but comfortable
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [40, 40, 40],
        overflow: 'linebreak',
        valign: 'middle',
        minCellHeight: 10, // Reduced from 12 for more rows per page
      },
      
      // Header styling
      headStyles: {
        fillColor: [43, 182, 115], // Green to match theme
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        halign: 'left',
        valign: 'middle',
      },
      
      // Alternating row colors for readability
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      
      // Body styling
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      
      // Margin configuration - optimized for maximum space usage
      margin: { 
        top: 38,  // Match startY
        left: 8,  // Reduced from 10
        right: 8, // Reduced from 10
        bottom: 15 // Reduced from 20
      },
      
      // Page break behavior - optimized
      showHead: 'everyPage', // Repeat header on every page
      pageBreak: 'auto',
      rowPageBreak: 'avoid', // Avoid splitting rows across pages
      tableWidth: 'wrap', // Wrap to content width for precise control
      
      // Draw header only on first page, then minimal header on subsequent pages
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages()
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.height || pageSize.getHeight()
        const pageWidth = pageSize.width || pageSize.getWidth()
        
        // Only draw full header on first page
        if (data.pageNumber === 1) {
          // Already drawn above
        } else {
          // Minimal header for subsequent pages
          doc.setFillColor(43, 182, 115)
          doc.rect(0, 0, 297, 10, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.text('NetCare Ticket Report (continued)', 10, 7)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(`${rows.length} Records`, 287, 7, { align: 'right' })
        }
        
        // Footer
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        
        // Page number
        const pageText = `Page ${data.pageNumber} of ${pageCount}`
        doc.text(
          pageText,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        )
        
        // Company info
        doc.setFontSize(7)
        doc.text('NetCare Support System', 8, pageHeight - 8)
        doc.text('© 2026 Ethio Telecom', pageWidth - 8, pageHeight - 8, {
          align: 'right',
        })
      },
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
