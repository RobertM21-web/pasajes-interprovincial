'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface ExportPDFButtonProps {
  tipo: 'boletos' | 'hoja-ruta' | 'ingresos' | 'pasajeros'
  data: any[]
  extraInfo?: any
  label?: string
  titulo?: string
  variant?: 'primary' | 'outline'
}

export default function ExportPDFButton({
  tipo,
  data,
  extraInfo,
  label,
  titulo,
  variant = 'outline',
}: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)

      if (tipo === 'boletos') {
        const { generateBoletosReporte } = await import('@/lib/pdf-generator')
        generateBoletosReporte(data, titulo || 'Boletos Vendidos')
        return
      }

      if (tipo === 'ingresos') {
        const { generateIngresosPorRuta } = await import('@/lib/pdf-generator')
        generateIngresosPorRuta(data, titulo || 'Ingresos por Ruta')
        return
      }

      if (tipo === 'pasajeros') {
        const { generateBoletosReporte } = await import('@/lib/pdf-generator')
        generateBoletosReporte(data, titulo || 'Pasajeros por Viaje')
        return
      }

      const { generateHojaRutaPDF } = await import('@/lib/pdf-generator')
      generateHojaRutaPDF(extraInfo || { rutas: data })
    } catch (error) {
      console.error('Error al generar PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  const className =
    variant === 'primary'
      ? 'inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
      : 'inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button type="button" onClick={handleExport} disabled={loading} className={className}>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? 'Generando...' : label || 'Exportar PDF'}
    </button>
  )
}
