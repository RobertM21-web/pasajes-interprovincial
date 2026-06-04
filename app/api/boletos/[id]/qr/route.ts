import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { generateBoletoQR } from '@/lib/qr'

// GET /api/boletos/[id]/qr — generar o regenerar QR de un boleto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validamos primero la existencia para retornar los datos en la respuesta
    const boleto = await prisma.boleto.findUnique({
      where: { id },
      include: {
        ruta: {
          include: {
            frecuencia: true
          }
        },
        asiento: true
      }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado' },
        { status: 404 }
      )
    }

    if (boleto.estado === 'CANCELADO') {
      return NextResponse.json(
        { error: 'El boleto está cancelado' },
        { status: 400 }
      )
    }

    // Generar el QR usando la función reutilizable
    const qrBase64 = await generateBoletoQR(id)

    return NextResponse.json({
      boletoId: boleto.id,
      pasajero: boleto.pasajeroNombre,
      asiento: boleto.asiento.etiqueta,
      origen: boleto.origenTramo,
      destino: boleto.destinoTramo,
      fecha: boleto.ruta.fecha,
      hora: boleto.ruta.frecuencia.hora,
      qr: qrBase64
    })
  } catch (error: any) {
    console.error('Error al generar QR:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar QR' },
      { status: 500 }
    )
  }
}
