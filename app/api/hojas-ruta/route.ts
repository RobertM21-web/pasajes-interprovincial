import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/hojas-ruta — listar todas las hojas de ruta
export async function GET() {
  try {
    const hojas = await prisma.hojaRuta.findMany({
      include: {
        oficinista: {
          select: { id: true, nombre: true, email: true }
        },
        rutas: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(hojas)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener hojas de ruta' },
      { status: 500 }
    )
  }
}

// POST /api/hojas-ruta — crear nueva hoja de ruta
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { oficinistaId, fechaInicio, tipo } = body

    if (!oficinistaId || !fechaInicio) {
      return NextResponse.json(
        { error: 'oficinistaId y fechaInicio son requeridos' },
        { status: 400 }
      )
    }

    // Solo puede haber una hoja habilitada a la vez
    await prisma.hojaRuta.updateMany({
      where: { habilitada: true },
      data: { habilitada: false }
    })

    const hoja = await prisma.hojaRuta.create({
      data: {
        oficinistaId,
        fechaInicio: new Date(fechaInicio),
        tipo: tipo || 'SEMANAL',
        habilitada: true
      },
      include: {
        oficinista: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return NextResponse.json(hoja, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear hoja de ruta' },
      { status: 500 }
    )
  }
}