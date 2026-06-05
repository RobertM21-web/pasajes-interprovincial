import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pagos/estado/[boletoId] — cliente consulta estado de su pago
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boletoId: string }> }
) {
  try {
    const { boletoId } = await params

    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
      select: {
        id: true,
        estado: true,
        motivoRechazo: true,
        codigoQr: true,
        pasajeroNombre: true,
        origenTramo: true,
        destinoTramo: true,
        precioFinal: true,
        ruta: {
          select: {
            fecha: true,
            frecuencia: {
              select: { hora: true }
            }
          }
        },
        asiento: {
          select: { etiqueta: true }
        }
      }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(boleto)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al consultar estado del pago' },
      { status: 500 }
    )
  }
}