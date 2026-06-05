import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/pagos — registrar comprobante de pago de un boleto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { boletoId, comprobanteUrl, metodoPago } = body

    if (!boletoId || !comprobanteUrl) {
      return NextResponse.json(
        { error: 'boletoId y comprobanteUrl son requeridos' },
        { status: 400 }
      )
    }

    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado' },
        { status: 404 }
      )
    }

    if (boleto.estado === 'CANCELADO') {
      return NextResponse.json(
        { error: 'No se puede registrar pago de un boleto cancelado' },
        { status: 400 }
      )
    }

    const boletoActualizado = await prisma.boleto.update({
      where: { id: boletoId },
      data: {
        comprobanteUrl,
        metodoPago: metodoPago || 'TRANSFERENCIA',
        estado: 'PENDIENTE'
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } }
      }
    })

    return NextResponse.json(boletoActualizado)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al registrar el comprobante' },
      { status: 500 }
    )
  }
}

// GET /api/pagos — listar boletos con comprobante pendiente de validación
// GET /api/pagos — listar boletos con comprobante pendiente de validación
export async function GET() {
  try {
    const boletos = await prisma.boleto.findMany({
      where: {
        estado: 'PENDIENTE',
        comprobanteUrl: { not: null }
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } },
        usuario: { select: { id: true, nombre: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(boletos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener comprobantes pendientes' },
      { status: 500 }
    )
  }
}