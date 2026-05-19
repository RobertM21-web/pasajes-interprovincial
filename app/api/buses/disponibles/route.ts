import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Por simplificación inicial, traemos todos los buses activos y en terminal
    const buses = await prisma.bus.findMany({
      where: { 
        activo: true,
        enTerminal: true
      },
      orderBy: { numero: 'asc' }
    })

    return NextResponse.json(buses)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
