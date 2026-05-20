import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// PATCH /api/hojas-ruta/[id]/habilitar — habilitar una hoja de ruta
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const hoja = await prisma.hojaRuta.findUnique({
      where: { id }
    })

    if (!hoja) {
      return NextResponse.json(
        { error: 'Hoja de ruta no encontrada' },
        { status: 404 }
      )
    }

    // Deshabilitar todas las demás
    await prisma.hojaRuta.updateMany({
      where: { habilitada: true },
      data: { habilitada: false }
    })

    // Habilitar la seleccionada
    const hojaActualizada = await prisma.hojaRuta.update({
      where: { id },
      data: { habilitada: true },
      include: {
        oficinista: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return NextResponse.json(hojaActualizada)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al habilitar hoja de ruta' },
      { status: 500 }
    )
  }
}