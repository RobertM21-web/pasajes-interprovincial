import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/ventas — vender un boleto desde oficina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      rutaId,
      asientoId,
      vendidoPorId,
      pasajeroNombre,
      pasajeroCedula,
      tipoPasajero,
      origenTramo,
      destinoTramo,
      metodoPago,
      emailEnvio
    } = body

    // Validar campos requeridos
    if (!rutaId || !asientoId || !vendidoPorId || !pasajeroNombre || !pasajeroCedula || !origenTramo || !destinoTramo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el asiento no esté ocupado
    const boletoExistente = await prisma.boleto.findUnique({
      where: { rutaId_asientoId: { rutaId, asientoId } }
    })

    if (boletoExistente && boletoExistente.estado !== 'CANCELADO') {
      return NextResponse.json(
        { error: 'El asiento ya está ocupado' },
        { status: 409 }
      )
    }

    // Obtener precio del asiento
    const asiento = await prisma.asiento.findUnique({
      where: { id: asientoId },
      include: { categoria: true }
    })

    if (!asiento) {
      return NextResponse.json(
        { error: 'Asiento no encontrado' },
        { status: 404 }
      )
    }

    // Calcular descuento según tipo de pasajero
    const precioBase = Number(asiento.categoria.precioBase)
    let descuento = 0
    if (tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACIDAD') {
      descuento = 0.5 // 50% de descuento
    } else if (tipoPasajero === 'MENOR_EDAD') {
      descuento = 0.25 // 25% de descuento
    }

    const precioFinal = precioBase * (1 - descuento)

    // Crear el boleto
    const boleto = await prisma.boleto.create({
      data: {
        rutaId,
        asientoId,
        vendidoPorId,
        pasajeroNombre,
        pasajeroCedula,
        tipoPasajero: tipoPasajero || 'NORMAL',
        precioBase,
        descuento,
        precioFinal,
        metodoPago: metodoPago || 'TRANSFERENCIA',
        canalVenta: 'OFICINA',
        origenTramo,
        destinoTramo,
        emailEnvio: emailEnvio?.trim()?.toLowerCase() || null,
        estado: 'PAGADO'
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } },
        vendidoPor: { select: { id: true, nombre: true } }
      }
    })

    return NextResponse.json(boleto, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al registrar la venta' },
      { status: 500 }
    )
  }
}

// GET /api/ventas — listar boletos vendidos en oficina
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rutaId = searchParams.get('rutaId')

    const where = {
      canalVenta: 'OFICINA' as const,
      ...(rutaId && { rutaId })
    }

    const boletos = await prisma.boleto.findMany({
      where,
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } },
        vendidoPor: { select: { id: true, nombre: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(boletos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}
