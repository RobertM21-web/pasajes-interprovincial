import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origen = searchParams.get('origen')?.trim() || ""
    const destino = searchParams.get('destino')?.trim() || ""
    const fecha = searchParams.get('fecha')

    if (!origen || !destino || !fecha) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const fechaInicio = new Date(fecha);
    fechaInicio.setUTCHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setUTCHours(23, 59, 59, 999);

    const rutas = await prisma.ruta.findMany({
      where: {
        fecha: { gte: fechaInicio, lte: fechaFin },
        estado: '1',
        frecuencia: {
          activa: true,
          OR: [
            { ciudadOrigen: { contains: origen }, ciudadDestino: { contains: destino } },
            { ciudadOrigen: { contains: origen }, paradasIntermedias: { some: { ciudad: { contains: destino } } } }
          ]
        }
      },
      include: {
        frecuencia: { include: { paradasIntermedias: { orderBy: { orden: 'asc' } } } },
        bus: { include: { categorias: true } }
      }
    })

    const rutasConDisponibilidad = await Promise.all(
      rutas.map(async (ruta) => {
        // 1. Contar boletos VENDIDOS (excluyendo cancelados)
        const boletosVendidos = await prisma.boleto.count({
          where: {
            rutaId: ruta.id,
            estado: { not: '0' } // Ajusta '0' si tu estado de cancelado es distinto
          }
        })

        // 2. Calcular asientos disponibles
        const totalAsientos = ruta.bus.totalAsientos || 0
        const asientosDisponibles = Math.max(0, totalAsientos - boletosVendidos)

        // 3. Determinar precio (si es parada intermedia o ruta directa)
        const paradaDestino = ruta.frecuencia.paradasIntermedias.find(
          p => p.ciudad.toLowerCase().includes(destino.toLowerCase())
        )
        const precio = paradaDestino 
          ? Number(paradaDestino.precioTramo) 
          : Number(ruta.bus.categorias?.[0]?.precioBase ?? 0)

        return {
          id: ruta.id,
          origen: ruta.frecuencia.ciudadOrigen,
          destino: ruta.frecuencia.ciudadDestino,
          hora: ruta.frecuencia.hora,
          fecha: ruta.fecha,
          precio,
          asientosDisponibles,
          bus: { numero: ruta.bus.numero },
          paradas: ruta.frecuencia.paradasIntermedias.map(p => p.ciudad)
        }
      })
    )

    return NextResponse.json(rutasConDisponibilidad)
  } catch (error) {
    console.error("Error en API:", error)
    return NextResponse.json({ error: 'Error al procesar la búsqueda' }, { status: 500 })
  }
}