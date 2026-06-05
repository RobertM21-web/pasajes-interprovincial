import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const COMPROBANTES_DIR = path.join(process.cwd(), 'public', 'comprobantes')

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (!match) return null
  return {
    mimeType: match[1],
    base64: match[2],
  }
}

function extensionFromMimeType(mimeType: string) {
  switch (mimeType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'application/pdf':
      return 'pdf'
    default:
      return 'bin'
  }
}

async function saveComprobanteFile(dataUrl: string) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) {
    throw new Error('Formato de comprobante inválido')
  }

  const extension = extensionFromMimeType(parsed.mimeType)
  const fileName = `comprobante-${randomUUID()}.${extension}`
  const filePath = path.join(COMPROBANTES_DIR, fileName)

  await fs.mkdir(COMPROBANTES_DIR, { recursive: true })
  await fs.writeFile(filePath, Buffer.from(parsed.base64, 'base64'))

  return `/comprobantes/${fileName}`
}

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

    let comprobanteStored = comprobanteUrl
    const parsed = parseDataUrl(comprobanteUrl)
    if (parsed) {
      comprobanteStored = await saveComprobanteFile(comprobanteUrl)
    }

    const boletoActualizado = await prisma.boleto.update({
      where: { id: boletoId },
      data: {
        comprobanteUrl: comprobanteStored,
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
    console.error('Error en POST /api/pagos:', error)
    return NextResponse.json(
      { error: 'Error al registrar el comprobante' },
      { status: 500 }
    )
  }
}

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
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
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