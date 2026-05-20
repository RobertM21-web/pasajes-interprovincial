import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

const crearHojaRutaSchema = z.object({
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  fechaFin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  tipo: z.enum(['SEMANAL', 'MENSUAL'])
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const userEmail = session?.user?.email
    if (!session || !userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: userEmail },
      include: { rol: true }
    })

    if (!usuario || (usuario.rol.nombre !== 'OFICINISTA' && usuario.rol.nombre !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Hoja activa: la más reciente habilitada.
    const hojaActiva = await prisma.hojaRuta.findFirst({
      where: {
        oficinistaId: usuario.id,
        habilitada: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        rutas: {
          include: {
            frecuencia: true,
            bus: true
          }
        }
      }
    })

    if (!hojaActiva) {
      return NextResponse.json({ message: 'No hay hoja de ruta activa' }, { status: 404 })
    }

    return NextResponse.json(hojaActiva)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const userEmail = session?.user?.email
    if (!session || !userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: userEmail },
      include: { rol: true }
    })

    if (!usuario || (usuario.rol.nombre !== 'OFICINISTA' && usuario.rol.nombre !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = crearHojaRutaSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 })
    }

    const { fechaInicio, fechaFin, tipo } = parsed.data
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (inicio >= fin) {
      return NextResponse.json({ error: 'La fecha de inicio debe ser anterior a la fecha fin' }, { status: 400 })
    }

    // Deshabilitar hojas anteriores para asegurar 1 sola activa por oficinista
    await prisma.hojaRuta.updateMany({
      where: {
        oficinistaId: usuario.id,
        habilitada: true
      },
      data: {
        habilitada: false
      }
    })

    const nuevaHoja = await prisma.hojaRuta.create({
      data: {
        oficinistaId: usuario.id,
        fechaInicio: inicio,
        tipo,
        habilitada: true
      }
    })

    return NextResponse.json(nuevaHoja, { status: 201 })
  } catch (error) {
    console.error('Error al crear hoja de ruta:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
