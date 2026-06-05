import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { BoletoQR } from '@/components/boletos/BoletoQR'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

export default async function BoletoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession()
  const userEmail = session?.user?.email

  if (!session || !userEmail) {
    redirect('/api/auth/signin')
  }

  const { id } = await params

  if (!id) {
    notFound()
  }

  const usuarioActual = await prisma.usuario.findUnique({
    where: { email: userEmail },
    include: { rol: true }
  })

  if (!usuarioActual) {
    redirect('/api/auth/signin')
  }

  const esAdminOficinista = ['ADMIN', 'OFICINISTA'].includes(usuarioActual.rol.nombre)

  const boleto = await prisma.boleto.findUnique({
    where: { id },
    include: {
      ruta: {
        include: {
          frecuencia: true,
          bus: true
        }
      },
      asiento: {
        include: {
          categoria: true
        }
      }
    }
  })

  if (!boleto) {
    notFound()
  }

  const esDuenio = boleto.usuarioId === usuarioActual.id

  if (!esDuenio && !esAdminOficinista) {
    // Redirigimos si no tiene permisos
    redirect('/cliente/boletos')
  }

  // Obtener config
  const config = await prisma.configuracion.findFirst()

  // Serializar Decimal y Date para Client Component
  const boletoSerializado = {
    ...boleto,
    precioBase: Number(boleto.precioBase),
    descuento: Number(boleto.descuento),
    precioFinal: Number(boleto.precioFinal),
    ruta: {
      ...boleto.ruta,
      fecha: boleto.ruta.fecha.toISOString(),
      frecuencia: boleto.ruta.frecuencia,
      bus: boleto.ruta.bus
    },
    asiento: {
      ...boleto.asiento,
      categoria: {
        ...boleto.asiento.categoria,
        precioBase: Number(boleto.asiento.categoria.precioBase),
      },
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Botonera Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <Link 
          href="/cliente/boletos"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a mis boletos
        </Link>
        <button className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium">
          <Download className="w-5 h-5 mr-2" />
          Descargar Boleto
        </button>
      </div>

      {/* Alerta de Cancelado */}
      {boleto.estado === 'CANCELADO' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl shadow-sm">
          <h3 className="text-red-800 font-bold text-lg">Boleto Cancelado</h3>
          <p className="text-red-600 mt-1">Este boleto ha sido cancelado y ya no es válido para abordar. Por favor, comunícate con soporte si consideras que es un error.</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Ticket visual */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 lg:order-1">
          <BoletoQR boleto={boletoSerializado} configuracion={config} />
        </div>

        {/* Resumen adicional */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 order-1 lg:order-2">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Detalles de la Ruta</h2>
          
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pasajero</p>
                <p className="font-semibold text-gray-900 text-lg">{boleto.pasajeroNombre}</p>
                <p className="text-sm text-gray-600">Cédula: {boleto.pasajeroCedula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo de Pasajero</p>
                <p className="font-semibold text-gray-900">{boleto.tipoPasajero.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="pb-5 border-b border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Unidad de Transporte</p>
                <p className="font-semibold text-gray-900 text-lg">Bus #{boleto.ruta.bus.numero}</p>
                <p className="text-sm text-gray-600">Placa: {boleto.ruta.bus.placa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Cooperativa</p>
                <p className="font-semibold text-gray-900">{config?.nombreCooperativa || 'N/A'}</p>
              </div>
            </div>

            <div className="pb-5 border-b border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ubicación</p>
                <p className="font-semibold text-blue-600 text-2xl">Asiento {boleto.asiento.etiqueta}</p>
                <p className="text-sm text-gray-600 mt-1">Categoría: {boleto.asiento.categoria.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ubicación en Bus</p>
                <p className="font-semibold text-gray-900">Fila {boleto.asiento.fila} - {boleto.asiento.posicion}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Estado de Pago</p>
                <p className="font-semibold text-gray-900">Método: {boleto.metodoPago.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">Canal: {boleto.canalVenta}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Comprobante</p>
                {boleto.comprobanteUrl ? (
                  <a href={boleto.comprobanteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Ver comprobante adjunto</a>
                ) : (
                  <p className="text-gray-500 italic">No adjuntado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
