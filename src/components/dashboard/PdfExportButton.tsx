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

    // Professional header with gradient background
    doc.setFillColor(0, 114, 206)
    doc.rect(0, 0, 297, 38, 'F')

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 9, 32, 20)
    }
    
    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('NetCare Ticket Report', 50, 18)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(title ?? 'Administrative Report', 50, 26)
    
    doc.setFontSize(9)
    const dateStr = new Date().toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.text(`Generated on ${dateStr}`, 50, 32)
    
    // Add total count on the right side
    doc.setFontSize(10)
    doc.text(`Total Records: ${rows.length}`, 250, 26)

    // Intelligent column width allocation based on content
    // Total available width in landscape: ~277mm (297 - 20mm margins)
    const columnStyles = {
      0: { cellWidth: 22, halign: 'left' as const },      // Ticket # - fixed width
      1: { cellWidth: 52, halign: 'left' as const },      // Subject - wider for readability
      2: { cellWidth: 24, halign: 'center' as const },    // Status - centered
      3: { cellWidth: 20, halign: 'center' as const },    // Priority - centered
      4: { cellWidth: 26, halign: 'left' as const },      // Category
      5: { cellWidth: 38, halign: 'left' as const },      // Customer - wider for names
      6: { cellWidth: 35, halign: 'left' as const },      // Technician - wider for names
      7: { cellWidth: 32, halign: 'left' as const },      // Created - date/time
      8: { cellWidth: 32, halign: 'left' as const },      // Resolved - date/time
      9: { cellWidth: 16, halign: 'center' as const },    // Rating - centered
    }

    autoTable(doc, {
      head: [headers],
      body: rows.map((row) => row.map(String)),
      startY: 46,
      theme: 'striped',
      
      // Column configuration
      columnStyles,
      
      // Table styling
      styles: {
        fontSize: 9,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [40, 40, 40],
        overflow: 'linebreak',
        valign: 'middle',
        minCellHeight: 12, // Comfortable row height
      },
      
      // Header styling
      headStyles: {
        fillColor: [0, 114, 206],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
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
      
      // Margin configuration - use page space efficiently
      margin: { 
        top: 46, 
        left: 10, 
        right: 10, 
        bottom: 20 
      },
      
      // Page break behavior
      showHead: 'everyPage', // Repeat header on every page
      pageBreak: 'auto',
      rowPageBreak: 'avoid', // Avoid splitting rows across pages
      
      // Footer with page numbers
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages()
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.height || pageSize.getHeight()
        const pageWidth = pageSize.width || pageSize.getWidth()
        
        doc.setFontSize(9)
        doc.setTextColor(128, 128, 128)
        
        // Page number
        const pageText = `Page ${data.pageNumber} of ${pageCount}`
        doc.text(
          pageText,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
        
        // Company info
        doc.setFontSize(8)
        doc.text('NetCare Support System', 10, pageHeight - 10)
        doc.text('© 2026 Ethio Telecom', pageWidth - 10, pageHeight - 10, {
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
