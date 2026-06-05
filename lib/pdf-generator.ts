// Esta utilidad SOLO se ejecuta en el cliente (browser)

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function crearDocumentoBase(titulo: string, subtitulo: string) {
  void autoTable

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const fechaGeneracion = new Date().toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor('#1E40AF')
  doc.text('COOPERATIVA DE TRANSPORTES', 14, 20)

  doc.setDrawColor('#1E40AF')
  doc.line(14, 25, 196, 25)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor('#111827')
  doc.text(titulo, 14, 32)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor('#6B7280')
  doc.text(subtitulo, 14, 38)

  doc.setFontSize(8)
  doc.setTextColor('#9CA3AF')
  doc.text(`Generado el: ${fechaGeneracion}`, 196, 38, { align: 'right' })

  return { doc, startY: 44 }
}

function formatearFechaArchivo(): string {
  const fecha = new Date()
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  const hours = String(fecha.getHours()).padStart(2, '0')
  const minutes = String(fecha.getMinutes()).padStart(2, '0')

  return `${year}${month}${day}-${hours}${minutes}`
}

export function generateBoletosReporte(boletos: any[], titulo: string): void {
  const { doc, startY } = crearDocumentoBase(titulo, 'Reporte de boletos vendidos')

  if (boletos.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor('#6B7280')
    doc.text('No hay boletos para mostrar', 105, 140, { align: 'center' })
  } else {
    autoTable(doc, {
      startY: startY,
      head: [['ID', 'Pasajero', 'Cédula', 'Origen', 'Destino', 'Asiento', 'Estado', 'Precio']],
      body: boletos.map((b) => [
        (b.id || '').substring(0, 8).toUpperCase(),
        b.pasajeroNombre || b.pasajero || '-',
        b.pasajeroCedula || b.cedula || '-',
        b.origenTramo || b.origen || '-',
        b.destinoTramo || b.destino || '-',
        b.asiento?.etiqueta || b.asiento || '-',
        b.estado || '-',
        '$' + (Number(b.precioFinal || b.precio || 0)).toFixed(2),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: {
        0: { cellWidth: 22 },
        7: { halign: 'right' },
      },
    })

    const finalY = (doc as any).lastAutoTable?.finalY || startY
    const hayPreciosDisponibles = boletos.some(
      (b) => b.precioFinal !== undefined || b.precio !== undefined
    )
    const totalIngresos = boletos.reduce(
      (total, b) => total + Number(b.precioFinal || b.precio || 0),
      0
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor('#111827')
    doc.text(`Total de boletos: ${boletos.length}`, 196, finalY + 10, { align: 'right' })

    if (hayPreciosDisponibles) {
      doc.text(`Total ingresos: $${totalIngresos.toFixed(2)}`, 196, finalY + 16, { align: 'right' })
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    doc.setPage(pageNumber)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor('#9CA3AF')
    doc.text(`Página ${pageNumber} de ${pageCount}`, 105, 287, { align: 'center' })
  }

  doc.save('boletos-' + formatearFechaArchivo() + '.pdf')
}

export { crearDocumentoBase, formatearFechaArchivo }
