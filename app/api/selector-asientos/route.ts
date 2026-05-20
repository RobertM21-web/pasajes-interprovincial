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
    // Verificar que la ruta existe con el diseño de relaciones de Sandro
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
    const asientosOcupados = new Set(boletosVendidos.map(b => b.asientoId))
    // Construir respuesta asegurando que el precioBase se procese como número decimal correcto
    const asientos = ruta.bus.categorias.flatMap(categoria =>
      categoria.asientos.map(asiento => ({
        id: asiento.id,
        numero: asiento.numero,
        etiqueta: asiento.etiqueta,
        fila: asiento.fila,
        posicion: asiento.posicion,
        categoria: categoria.nombre, // Recibe "NORMAL", "VIP", "DISCAPACIDAD", etc.
        precioBase: Number(categoria.precioBase), // Forzado a número para que no falle .toFixed()
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
  } catch (error: any) {
    console.error("Error detallado en selector-asientos:", error) // Nos ayuda a debuggear en la terminal
    return NextResponse.json(
      { error: 'Error al obtener asientos', detalle: error.message },
      { status: 500 }
    )
  }
}