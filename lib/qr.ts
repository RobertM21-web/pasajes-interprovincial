import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function generateBoletoQR(boletoId: string): Promise<string> {
  const boleto = await prisma.boleto.findUnique({
    where: { id: boletoId },
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
    throw new Error('Boleto no encontrado')
  }

  if (boleto.estado === 'CANCELADO') {
    throw new Error('El boleto está cancelado')
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

  // Generar QR como dataURL en base64
  const qrBase64 = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000', // Color oscuro para los módulos del código
      light: '#ffffff' // Color claro para el fondo
    }
  })

  // Guardar el QR en la base de datos si no lo tiene, o actualizarlo
  await prisma.boleto.update({
    where: { id: boletoId },
    data: { codigoQr: qrBase64 }
  })

  return qrBase64
}
