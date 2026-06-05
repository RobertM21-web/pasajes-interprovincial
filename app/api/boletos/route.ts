import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST /api/boletos — crear boleto con validación de concurrencia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      rutaId,
      asientoId,
      usuarioId: bodyUsuarioId,
      vendidoPorId,
      pasajeroNombre,
      pasajeroCedula,
      tipoPasajero,
      origenTramo,
      destinoTramo,
      metodoPago,
      canalVenta
    } = body
    const session = await getServerSession(authOptions)
    const usuarioId = bodyUsuarioId || session?.user?.id

    if (!rutaId || !asientoId || !pasajeroNombre || !pasajeroCedula || !origenTramo || !destinoTramo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener precio del asiento y validar existencia
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

    const precioBase = Number(asiento.categoria.precioBase)
    let descuento = 0
    if (tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACIDAD') {
      descuento = 0.5
    } else if (tipoPasajero === 'MENOR_EDAD') {
      descuento = 0.25
    }

    const precioFinal = precioBase * (1 - descuento)

    const boleto = await prisma.boleto.create({
      data: {
        rutaId,
        asientoId,
        usuarioId,
        vendidoPorId,
        pasajeroNombre,
        pasajeroCedula,
        tipoPasajero: tipoPasajero || 'NORMAL',
        precioBase,
        descuento,
        precioFinal,
        metodoPago: metodoPago || 'TRANSFERENCIA',
        canalVenta: canalVenta || 'ONLINE',
        origenTramo,
        destinoTramo,
        estado: canalVenta === 'OFICINA' ? 'PAGADO' : 'PENDIENTE'
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } }
      }
    })

    return NextResponse.json(boleto, { status: 201 })

  } catch (error: any) {
    console.error('Error en POST /api/boletos:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El asiento ya fue tomado por otro usuario' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear el boleto', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
