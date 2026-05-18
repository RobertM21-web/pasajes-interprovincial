import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/rutas — buscar rutas disponibles por origen, destino y fecha
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origen = searchParams.get('origen')
    const destino = searchParams.get('destino')
    const fecha = searchParams.get('fecha')

    if (!origen || !destino || !fecha) {
      return NextResponse.json(
        { error: 'origen, destino y fecha son requeridos' },
        { status: 400 }
      )
    }

    const rutas = await prisma.ruta.findMany({
      where: {
        fecha: new Date(fecha),
        estado: 'HABILITADA',
        frecuencia: {
          activa: true,
          OR: [
            // Ruta directa
            {
              ciudadOrigen: { contains: origen },
              ciudadDestino: { contains: destino }
            },
            // Ruta con paradas intermedias
            {
              ciudadOrigen: { contains: origen },
              paradasIntermedias: {
                some: { ciudad: { contains: destino } }
              }
            }
          ]
        }
      },
      include: {
        frecuencia: {
          include: { paradasIntermedias: { orderBy: { orden: 'asc' } } }
        },
        bus: {
          include: {
            categorias: {
              include: { asientos: true }
            }
          }
        }
      },
      orderBy: { frecuencia: { hora: 'asc' } }
    })

    // Calcular asientos disponibles por ruta
    const rutasConDisponibilidad = await Promise.all(
      rutas.map(async (ruta) => {
        const boletosVendidos = await prisma.boleto.count({
          where: {
            rutaId: ruta.id,
            estado: { not: 'CANCELADO' }
          }
        })

        const totalAsientos = ruta.bus.totalAsientos
        const asientosDisponibles = totalAsientos - boletosVendidos

        // Precio según tramo
        const esDirecta = ruta.frecuencia.esDirecta
        const paradaDestino = ruta.frecuencia.paradasIntermedias.find(
          p => p.ciudad.toLowerCase().includes(destino.toLowerCase())
        )

        const precioTramo = paradaDestino
          ? Number(paradaDestino.precioTramo)
          : Number(ruta.bus.categorias[0]?.precioBase || 0)

        return {
          id: ruta.id,
          origen: ruta.frecuencia.ciudadOrigen,
          destino: ruta.frecuencia.ciudadDestino,
          hora: ruta.frecuencia.hora,
          fecha: ruta.fecha,
          esDirecta,
          precio: precioTramo,
          totalAsientos,
          asientosDisponibles,
          bus: {
            id: ruta.bus.id,
            numero: ruta.bus.numero
          },
          paradas: ruta.frecuencia.paradasIntermedias
        }
      })
    )

    return NextResponse.json(rutasConDisponibilidad)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al buscar rutas' },
      { status: 500 }
    )
  }
}