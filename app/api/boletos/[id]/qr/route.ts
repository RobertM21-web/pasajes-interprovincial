import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// GET /api/boletos/[id]/qr — generar QR de un boleto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Datos que va a contener el QR
    const qrData = JSON.stringify({
      boletoId: boleto.id,
      pasajero: boleto.pasajeroNombre,
      cedula: boleto.pasajeroCedula,
      origen: boleto.origenTramo,
      destino: boleto.destinoTramo,
      fecha: boleto.ruta.fecha,
      hora: boleto.ruta.frecuencia.hora,
      asiento: boleto.asiento.etiqueta,
      precio: boleto.precioFinal,
      estado: boleto.estado
    })

    // Generar QR como base64
    const qrBase64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2
    })

    // Guardar el QR en la base de datos
    await prisma.boleto.update({
      where: { id },
      data: { codigoQr: qrBase64 }
    })

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
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar QR' },
      { status: 500 }
    )
  }
}