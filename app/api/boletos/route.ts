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

    // Usar transacción para garantizar concurrencia segura
    const boleto = await prisma.$transaction(async (tx) => {

      // Verificar si el asiento ya está ocupado dentro de la transacción
      const boletoExistente = await tx.boleto.findUnique({
        where: { rutaId_asientoId: { rutaId, asientoId } }
      })

      if (boletoExistente && boletoExistente.estado !== 'CANCELADO') {
        throw new Error('ASIENTO_OCUPADO')
      }

      // Obtener precio del asiento
      const asiento = await tx.asiento.findUnique({
        where: { id: asientoId },
        include: { categoria: true }
      })

      if (!asiento) {
        throw new Error('ASIENTO_NO_ENCONTRADO')
      }

      // Calcular descuento
      const precioBase = Number(asiento.categoria.precioBase)
      let descuento = 0
      if (tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACIDAD') {
        descuento = 0.5
      } else if (tipoPasajero === 'MENOR_EDAD') {
        descuento = 0.25
      }

      const precioFinal = precioBase * (1 - descuento)

      // Crear boleto de forma atómica
      return await tx.boleto.create({
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
    })

    return NextResponse.json(boleto, { status: 201 })

  } catch (error: any) {
    if (error.message === 'ASIENTO_OCUPADO') {
      return NextResponse.json(
        { error: 'El asiento ya fue tomado por otro usuario' },
        { status: 409 }
      )
    }
    if (error.message === 'ASIENTO_NO_ENCONTRADO') {
      return NextResponse.json(
        { error: 'Asiento no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear el boleto' },
      { status: 500 }
    )
  }
}
