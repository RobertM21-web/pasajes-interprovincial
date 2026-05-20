import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

const rutaSchema = z.object({
  frecuenciaId: z.string().uuid(),
  busId: z.string().uuid(),
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  hojaRutaId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origen = searchParams.get('origen')?.trim()
    const destino = searchParams.get('destino')?.trim()
    const fecha = searchParams.get('fecha')

    // ============================================================================
    // CASO 1: BÚSQUEDA PÚBLICA DE RUTAS (CLIENTE - COMPRA ONLINE)
    // Se dispara si vienen parámetros de origen y destino en la URL
    // ============================================================================
    if (origen !== undefined && destino !== undefined) {
      if (!fecha) {
        return NextResponse.json({ error: 'Falta la fecha' }, { status: 400 })
      }

      const fechaInicio = new Date(fecha);
      fechaInicio.setUTCHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setUTCHours(23, 59, 59, 999);

      const rutas = await prisma.ruta.findMany({
        where: {
          fecha: { gte: fechaInicio, lte: fechaFin },
          estado: 'HABILITADA', // Corregido según schema.prisma
          frecuencia: {
            activa: true,
            OR: [
              { ciudadOrigen: { contains: origen }, ciudadDestino: { contains: destino } },
              { ciudadOrigen: { contains: origen }, paradasIntermedias: { some: { ciudad: { contains: destino } } } }
            ]
          }
        },
        include: {
          frecuencia: { include: { paradasIntermedias: { orderBy: { orden: 'asc' } } } },
          bus: { include: { categorias: true } }
        }
      })

      const rutasConDisponibilidad = await Promise.all(
        rutas.map(async (ruta) => {
          const boletosVendidos = await prisma.boleto.count({
            where: {
              rutaId: ruta.id,
              estado: { not: 'CANCELADO' } // Corregido según schema.prisma
            }
          })

          const totalAsientos = ruta.bus.totalAsientos || 0
          const asientosDisponibles = Math.max(0, totalAsientos - boletosVendidos)

          const paradaDestino = ruta.frecuencia.paradasIntermedias.find(
            p => p.ciudad.toLowerCase().includes(destino.toLowerCase())
          )
          const precio = paradaDestino 
            ? Number(paradaDestino.precioTramo) 
            : Number(ruta.bus.categorias?.[0]?.precioBase ?? 0)

          return {
            id: ruta.id,
            origen: ruta.frecuencia.ciudadOrigen,
            destino: ruta.frecuencia.ciudadDestino,
            hora: ruta.frecuencia.hora,
            fecha: ruta.fecha,
            precio,
            asientosDisponibles,
            bus: { numero: ruta.bus.numero },
            paradas: ruta.frecuencia.paradasIntermedias.map(p => p.ciudad)
          }
        })
      )

      return NextResponse.json(rutasConDisponibilidad)
    }

    // ============================================================================
    // CASO 2: OBTENER RUTAS DEL OFICINISTA (HOJA DE RUTA)
    // Requiere Autenticación
    // ============================================================================
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

    const whereClause: any = { oficinistaId: usuario.id }
    if (fecha) {
      const startDate = new Date(fecha)
      const endDate = new Date(fecha)
      endDate.setDate(endDate.getDate() + 1)
      whereClause.fecha = {
        gte: startDate,
        lt: endDate
      }
    }

    const rutasOficinista = await prisma.ruta.findMany({
      where: whereClause,
      include: {
        frecuencia: true,
        bus: true,
        hojaRuta: true
      },
      orderBy: {
        fecha: 'asc'
      }
    })

    return NextResponse.json(rutasOficinista)

  } catch (error) {
    console.error('Error al obtener rutas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
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
    const parsed = rutaSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 })
    }

    const { frecuenciaId, busId, fecha, hojaRutaId } = parsed.data
    const fechaRuta = new Date(fecha)

    // Validar hoja de ruta y rango de fechas
    const hojaRuta = await prisma.hojaRuta.findUnique({ where: { id: hojaRutaId } })
    if (!hojaRuta) {
      return NextResponse.json({ error: 'Hoja de ruta no encontrada' }, { status: 404 })
    }

    const dias = hojaRuta.tipo === 'SEMANAL' ? 6 : 29
    const fechaFin = new Date(hojaRuta.fechaInicio)
    fechaFin.setDate(fechaFin.getDate() + dias)
    fechaFin.setHours(23, 59, 59, 999)

    if (fechaRuta < hojaRuta.fechaInicio || fechaRuta > fechaFin) {
      return NextResponse.json({ error: 'La fecha seleccionada está fuera del rango de la hoja de ruta' }, { status: 400 })
    }

    // Validar frecuencia
    const frecuencia = await prisma.frecuencia.findUnique({ where: { id: frecuenciaId } })
    if (!frecuencia || !frecuencia.activa) {
      return NextResponse.json({ error: 'Frecuencia no encontrada o inactiva' }, { status: 400 })
    }

    // Validar bus y disponibilidad
    const bus = await prisma.bus.findUnique({ where: { id: busId } })
    if (!bus || !bus.enTerminal || !bus.activo) {
      return NextResponse.json({ error: 'El bus no existe, está inactivo o no se encuentra en terminal' }, { status: 400 })
    }

    // Validar concurrencia del bus en la misma fecha
    const rutaExistente = await prisma.ruta.findFirst({
      where: { busId, fecha: fechaRuta }
    })

    if (rutaExistente) {
      return NextResponse.json({ error: 'El bus ya se encuentra asignado a otra ruta en la fecha indicada' }, { status: 409 })
    }

    // Crear ruta
    const nuevaRuta = await prisma.ruta.create({
      data: {
        frecuenciaId,
        busId,
        fecha: fechaRuta,
        hojaRutaId,
        oficinistaId: usuario.id,
        estado: 'HABILITADA'
      }
    })

    return NextResponse.json(nuevaRuta, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear ruta:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Conflicto: Ya existe una asignación para este bus en la misma fecha y frecuencia' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}