import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/hojas-ruta/[id] — obtener una hoja de ruta por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hoja = await prisma.hojaRuta.findUnique({
      where: { id },
      include: {
        oficinista: {
          select: { id: true, nombre: true, email: true }
        },
        rutas: {
          include: {
            frecuencia: true,
            bus: true
          }
        }
      }
    })

    if (!hoja) {
      return NextResponse.json(
        { error: 'Hoja de ruta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(hoja)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener hoja de ruta' },
      { status: 500 }
    )
  }
}

// DELETE /api/hojas-ruta/[id] — eliminar una hoja de ruta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hoja = await prisma.hojaRuta.findUnique({ where: { id } })

    if (!hoja) {
      return NextResponse.json(
        { error: 'Hoja de ruta no encontrada' },
        { status: 404 }
      )
    }

    if (hoja.habilitada) {
      return NextResponse.json(
        { error: 'No se puede eliminar una hoja de ruta habilitada' },
        { status: 400 }
      )
    }

    await prisma.hojaRuta.delete({ where: { id } })

    return NextResponse.json({ message: 'Hoja de ruta eliminada correctamente' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar hoja de ruta' },
      { status: 500 }
    )
  }
}
