import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/selector-asientos?rutaId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rutaId = searchParams.get('rutaId')

    if (!rutaId) {
      return NextResponse.json(
        { error: 'rutaId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la ruta existe
    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId },
      include: {
        frecuencia: true,
        bus: {
          include: {
            categorias: {
              include: {
                asientos: true
              }
            }
          }
        }
      }
    })

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      )
    }

    // Obtener asientos ya ocupados en esta ruta
    const boletosVendidos = await prisma.boleto.findMany({
      where: {
        rutaId,
        estado: { not: 'CANCELADO' }
      },
      select: { asientoId: true }
    })

    const asientosOcupados = new Set(boletosVendidos.map((b: { asientoId: string }) => b.asientoId))

    // Construir respuesta con todos los asientos y su estado
    const asientos = ruta.bus.categorias.flatMap((categoria: any) =>
      categoria.asientos.map((asiento: any) => ({
        id: asiento.id,
        numero: asiento.numero,
        etiqueta: asiento.etiqueta,
        fila: asiento.fila,
        posicion: asiento.posicion,
        categoria: categoria.nombre,
        precioBase: categoria.precioBase,
        ocupado: asientosOcupados.has(asiento.id)
      }))
    )

    return NextResponse.json({
      ruta: {
        id: ruta.id,
        fecha: ruta.fecha,
        origen: ruta.frecuencia.ciudadOrigen,
        destino: ruta.frecuencia.ciudadDestino,
        hora: ruta.frecuencia.hora
      },
      bus: {
        id: ruta.bus.id,
        numero: ruta.bus.numero,
        totalAsientos: ruta.bus.totalAsientos
      },
      asientos
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener asientos' },
      { status: 500 }
    )
  }
}