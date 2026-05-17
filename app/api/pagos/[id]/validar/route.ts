import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/pagos/[id]/validar — oficinista valida o rechaza un comprobante
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { aprobado, vendidoPorId } = body

    if (aprobado === undefined || !vendidoPorId) {
      return NextResponse.json(
        { error: 'aprobado y vendidoPorId son requeridos' },
        { status: 400 }
      )
    }

    const boleto = await prisma.boleto.findUnique({
      where: { id }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado' },
        { status: 404 }
      )
    }

    if (boleto.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'Solo se pueden validar boletos en estado PENDIENTE' },
        { status: 400 }
      )
    }

    const boletoActualizado = await prisma.boleto.update({
      where: { id },
      data: {
        estado: aprobado ? 'PAGADO' : 'CANCELADO',
        vendidoPorId
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } },
        vendidoPor: { select: { id: true, nombre: true } }
      }
    })

    return NextResponse.json(boletoActualizado)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al validar el comprobante' },
      { status: 500 }
    )
  }
}