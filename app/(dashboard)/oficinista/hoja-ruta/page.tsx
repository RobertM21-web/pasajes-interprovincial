import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { FileText, Map, Bus, Clock, Calendar as CalendarIcon, Plus, CheckCircle2, PlayCircle, XCircle, MapPin, SearchX, Route } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { CrearHojaRutaModal } from '@/components/hoja-ruta/CrearHojaRutaModal'
import { HabilitarRutaModal } from '@/components/hoja-ruta/HabilitarRutaModal'
import ExportPDFButton from '@/components/ui/ExportPDFButton'

export default async function HojaRutaPage() {
  const session = await getServerSession()
  const userEmail = session?.user?.email

  if (!session || !userEmail) {
    redirect('/api/auth/signin')
  }

  // Obtener usuario autenticado y su rol
  const usuarioActual = await prisma.usuario.findUnique({
    where: { email: userEmail },
    include: { rol: true }
  })

  if (!usuarioActual) {
    redirect('/api/auth/signin')
  }

  // Validar autorización (OFICINISTA o ADMIN)
  if (usuarioActual.rol.nombre !== 'OFICINISTA' && usuarioActual.rol.nombre !== 'ADMIN') {
    redirect('/') // O a página de denegado
  }

  // Buscar hoja de ruta activa para este oficinista
  const hojaRutaActiva = await prisma.hojaRuta.findFirst({
    where: {
      oficinistaId: usuarioActual.id,
      habilitada: true
    },
    include: {
      rutas: {
        include: {
          frecuencia: true,
          bus: true
        },
        orderBy: [
          { fecha: 'asc' },
          { frecuencia: { hora: 'asc' } }
        ]
      }
    }
  })

  // Agrupar rutas por fecha local (Y-M-D)
  type RutaAgrupada = NonNullable<typeof hojaRutaActiva>['rutas'][0]
  const rutasAgrupadas: Record<string, RutaAgrupada[]> = {}
  
  if (hojaRutaActiva) {
    for (const ruta of hojaRutaActiva.rutas) {
      // Obtenemos un string YYYY-MM-DD para usar como llave segura
      const fechaStr = ruta.fecha.toISOString().split('T')[0]
      if (!rutasAgrupadas[fechaStr]) {
        rutasAgrupadas[fechaStr] = []
      }
      rutasAgrupadas[fechaStr].push(ruta)
    }
  }

  // Helper para el badge de estado
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'HABILITADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Habilitada
          </span>
        )
      case 'EN_CURSO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <PlayCircle className="w-3.5 h-3.5" />
            En Curso
          </span>
        )
      case 'COMPLETADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
            <FileText className="w-3.5 h-3.5" />
            Completada
          </span>
        )
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {estado}
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Hoja de Ruta</h1>
          <p className="text-gray-500 mt-1">Gestión de rutas y frecuencias asignadas</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hojaRutaActiva && hojaRutaActiva.rutas.length > 0 && (
            <ExportPDFButton
              tipo="hoja-ruta"
              data={hojaRutaActiva.rutas}
              extraInfo={{
                id: hojaRutaActiva.id,
                tipo: hojaRutaActiva.tipo,
                fechaInicio: hojaRutaActiva.fechaInicio.toISOString(),
                habilitada: hojaRutaActiva.habilitada,
                rutas: hojaRutaActiva.rutas
              }}
              label="Exportar hoja"
              variant="outline"
            />
          )}
          
          {!hojaRutaActiva ? (
            <CrearHojaRutaModal />
          ) : (
            <HabilitarRutaModal hojaRuta={{
              id: hojaRutaActiva.id,
              fechaInicio: hojaRutaActiva.fechaInicio.toISOString(),
              tipo: hojaRutaActiva.tipo
            }} />
          )}
        </div>
      </div>

      {/* Empty State */}
      {!hojaRutaActiva ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <SearchX className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin hoja de ruta activa</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Actualmente no tienes ninguna hoja de ruta habilitada. Crea una nueva para comenzar a gestionar tus asignaciones y ventas.
          </p>
          <CrearHojaRutaModal>
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95">
              <Plus className="w-5 h-5 mr-2 -ml-1" />
              Comenzar nueva hoja
            </button>
          </CrearHojaRutaModal>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Info Summary Card */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hoja Activa</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-gray-900">Tipo: {hojaRutaActiva.tipo}</h3>
                </div>
              </div>
            </div>
            <div className="flex gap-6 items-center bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">FECHA INICIO</p>
                <p className="font-bold text-gray-900">{formatDate(hojaRutaActiva.fechaInicio)}</p>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">RUTAS</p>
                <p className="font-bold text-gray-900">{hojaRutaActiva.rutas.length} Asignadas</p>
              </div>
            </div>
          </div>

          {/* Listado Agrupado o Estado Vacío de Rutas */}
          {hojaRutaActiva.rutas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Route className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hoja de ruta sin asignar</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                Tu hoja de ruta está lista, pero aún no se le han asignado viajes. Contacta con el administrador o asigna las rutas.
              </p>
              <HabilitarRutaModal hojaRuta={{
                id: hojaRutaActiva.id,
                fechaInicio: hojaRutaActiva.fechaInicio.toISOString(),
                tipo: hojaRutaActiva.tipo
              }}>
                <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Agregar rutas a esta hoja
                </button>
              </HabilitarRutaModal>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(rutasAgrupadas).map(([fecha, rutas]) => {
                // Reconstruimos un Date para el formato, asumiendo zona horaria UTC o local
                const dateObj = new Date(fecha + 'T12:00:00')

              return (
                <div key={fecha} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {formatDate(dateObj)}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200 ml-4"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rutas.map((ruta) => (
                      <div 
                        key={ruta.id} 
                        className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-2xl overflow-hidden group flex flex-col"
                      >
                        {/* Status bar */}
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                          <div className="flex items-center text-sm font-semibold text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {ruta.frecuencia.hora}
                          </div>
                          {getStatusBadge(ruta.estado)}
                        </div>
                        
                        {/* Route info */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-left w-full relative">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 outline outline-2 outline-blue-100"></div>
                                  <div className="w-px h-6 bg-gray-200 my-1"></div>
                                  <MapPin className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="flex flex-col flex-1">
                                  <span className="font-bold text-gray-900 text-lg leading-none mb-4 truncate" title={ruta.frecuencia.ciudadOrigen}>
                                    {ruta.frecuencia.ciudadOrigen}
                                  </span>
                                  <span className="font-bold text-gray-900 text-lg leading-none truncate" title={ruta.frecuencia.ciudadDestino}>
                                    {ruta.frecuencia.ciudadDestino}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100/50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                  <Bus className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad</p>
                                  <p className="font-bold text-gray-900">Bus #{ruta.bus.numero}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="inline-block px-2.5 py-1 bg-white rounded-md text-xs font-mono font-medium text-gray-600 border border-gray-200">
                                  {ruta.bus.placa}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Action */}
                        <Link href={`/oficinista/rutas/${ruta.id}`} className="absolute inset-0 z-10">
                          <span className="sr-only">Ver detalles de la ruta</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
